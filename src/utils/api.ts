import { isDev } from '../config';
import { getSSEStreamAsync } from './misc';
import { Configuration, Message } from './types';

// --- Type Definitions ---

export type APIMessageContentPart =
  | {
      type: 'text';
      text: string;
    }
  | {
      type: 'image_url';
      image_url: { url: string };
    }
  | {
      type: 'input_audio';
      input_audio: { data: string; format: 'wav' | 'mp3' };
    };

export type APIMessage = {
  role: Message['role'];
  content: string | APIMessageContentPart[];
};

// a non-complete list of props, only contains the ones we need
export interface LlamaCppServerProps {
  build_info: string;
  model: string;
  n_ctx: number;
  modalities?: {
    vision: boolean;
    audio: boolean;
  };
  // TODO: support params
}

// --- Helper Functions ---

/**
 * filter out redundant fields upon sending to API
 * also format extra into text
 */
function normalizeMsgsForAPI(messages: Readonly<Message[]>) {
  return messages.map((msg) => {
    if (msg.role !== 'user' || !msg.extra) {
      return {
        role: msg.role,
        content: msg.content,
      } as APIMessage;
    }

    // extra content first, then user text message in the end
    // this allow re-using the same cache prefix for long context
    const contentArr: APIMessageContentPart[] = [];

    for (const extra of msg.extra ?? []) {
      if (extra.type === 'context') {
        contentArr.push({
          type: 'text',
          text: extra.content,
        });
      } else if (extra.type === 'textFile') {
        contentArr.push({
          type: 'text',
          text: `File: ${extra.name}\nContent:\n\n${extra.content}`,
        });
      } else if (extra.type === 'imageFile') {
        contentArr.push({
          type: 'image_url',
          image_url: { url: extra.base64Url },
        });
      } else if (extra.type === 'audioFile') {
        contentArr.push({
          type: 'input_audio',
          input_audio: {
            data: extra.base64Data,
            format: /wav/.test(extra.mimeType) ? 'wav' : 'mp3',
          },
        });
      } else {
        throw new Error('Unknown extra type');
      }
    }

    // add user message to the end
    contentArr.push({
      type: 'text',
      text: msg.content,
    });

    return {
      role: msg.role,
      content: contentArr,
    };
  }) as APIMessage[];
}

/**
 * recommended for DeepsSeek-R1, filter out content between <think> and </think> tags
 */
function filterThoughtFromMsgs(messages: APIMessage[]) {
  if (isDev)
    console.debug(
      'filter thought messages\n',
      JSON.stringify(messages, null, 2)
    );

  return messages.map((msg) => {
    if (msg.role !== 'assistant') {
      return msg;
    }
    // assistant message is always a string
    const contentStr = msg.content as string;
    return {
      role: msg.role,
      content:
        msg.role === 'assistant'
          ? contentStr.split('</think>').at(-1)!.trim()
          : contentStr,
    } as APIMessage;
  });
}

// --- Main Inference API Functions ---

class ApiProvider {
  config: Configuration;

  private constructor(config: Configuration) {
    this.config = config;
  }

  static new(config: Configuration) {
    return new ApiProvider(config);
  }

  async getServerProps(): Promise<LlamaCppServerProps> {
    try {
      const response = await fetch(`${this.config.baseUrl}/props`, {
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey
            ? { Authorization: `Bearer ${this.config.apiKey}` }
            : {}),
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch server props');
      }
      const data = await response.json();
      if (isDev)
        console.debug('server props:\n', JSON.stringify(data, null, 2));
      return {
        build_info: data.build_info,
        model:
          data?.model_alias ||
          data?.model_path
            ?.split(/(\\|\/)/)
            .pop()
            ?.replace(/[-](?:[\d\w]+[_\d\w]+)(?:\.[a-z]+)?$/, ''),
        n_ctx: data.n_ctx,
        modalities: data?.modalities,
      };
    } catch (error) {
      console.error('Error fetching server props:', error);
      throw error;
    }
  }

  async v1ChatCompletions(
    messages: readonly Message[],
    abortSignal: AbortSignal
  ) {
    // prepare messages for API
    let apiMessages: APIMessage[] = [
      ...(this.config.systemMessage.length === 0
        ? []
        : [
            {
              role: 'system',
              content: this.config.systemMessage,
            } as APIMessage,
          ]),
      ...normalizeMsgsForAPI(messages),
    ];

    if (this.config.excludeThoughtOnReq) {
      apiMessages = filterThoughtFromMsgs(apiMessages);
    }

    if (isDev) console.debug({ messages: apiMessages });

    // prepare params
    let params = {
      messages: apiMessages,
      stream: true,
      cache_prompt: true,
      timings_per_token: !!this.config.showTokensPerSecond,
    };

    // advanced options
    if (this.config.overrideGenerationOptions)
      params = Object.assign(params, {
        temperature: this.config.temperature,
        top_k: this.config.top_k,
        top_p: this.config.top_p,
        min_p: this.config.min_p,
        max_tokens: this.config.max_tokens,
      });

    if (this.config.overrideSamplersOptions)
      params = Object.assign(params, {
        samplers: this.config.samplers,
        dynatemp_range: this.config.dynatemp_range,
        dynatemp_exponent: this.config.dynatemp_exponent,
        typical_p: this.config.typical_p,
        xtc_probability: this.config.xtc_probability,
        xtc_threshold: this.config.xtc_threshold,
      });

    if (this.config.overridePenaltyOptions)
      params = Object.assign(params, {
        repeat_last_n: this.config.repeat_last_n,
        repeat_penalty: this.config.repeat_penalty,
        presence_penalty: this.config.presence_penalty,
        frequency_penalty: this.config.frequency_penalty,
        dry_multiplier: this.config.dry_multiplier,
        dry_base: this.config.dry_base,
        dry_allowed_length: this.config.dry_allowed_length,
        dry_penalty_last_n: this.config.dry_penalty_last_n,
      });

    if (this.config.custom.trim().length)
      params = Object.assign(params, JSON.parse(this.config.custom));

    // send request
    const fetchResponse = await fetch(
      `${this.config.baseUrl}/v1/chat/completions`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(params),
        signal: abortSignal,
      }
    );

    if (fetchResponse.status !== 200) {
      const body = await fetchResponse.json();
      throw new Error(body?.error?.message || 'Unknown error');
    }

    return getSSEStreamAsync(fetchResponse);
  }

  private getHeaders(): HeadersInit {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.config.apiKey) {
      Object.assign(headers, {
        Authorization: `Bearer ${this.config.apiKey}`,
      });
    }
    return headers;
  }
}

export default ApiProvider;

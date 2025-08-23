// @ts-expect-error this package does not have typing
import TextLineStream from 'textlinestream';

// ponyfill for missing ReadableStream asyncIterator on Safari
import { asyncIterator } from '@sec-ant/readable-stream/ponyfill/asyncIterator';

import { isDev } from '../config';
import { Configuration, Message } from './types';
import { splitMessageContent } from './misc';

// --- Type Definitions ---

/**
 * Represents a single content part in an API message, supporting multiple content types
 * including text, images, and audio inputs for multimodal interactions. [[9]]
 */
export type InferenceApiMessageContentPart =
  | {
      /** The content type identifier */
      type: 'text';
      /** The text content */
      text: string;
    }
  | {
      /** The content type identifier */
      type: 'image_url';
      /** Image URL details */
      image_url: { url: string };
    }
  | {
      /** The content type identifier */
      type: 'input_audio';
      /** Audio input details */
      input_audio: { data: string; format: 'wav' | 'mp3' };
    };

/**
 * Represents a message structure compatible with the API endpoint.
 * Can contain either a simple string or an array of content parts for multimodal support. [[4]]
 */
export type InferenceApiMessage = {
  /** The role of the message sender (system, user, assistant) */
  role: Message['role'];
  /** The message content, which can be a string or structured content parts */
  content: string | InferenceApiMessageContentPart[];
};

/**
 * Represents model information returned by the API's models endpoint.
 * Contains basic model metadata that clients might need for display or selection. [[1]]
 */
export type InferenceApiModel = {
  /** Unique model identifier */
  id: string;
  /** User-friendly model name (optional) */
  name: string;
  /** Model description (optional) */
  description?: string;
  /** Timestamp of model creation (optional) */
  created?: number;
};

/**
 * Interface representing server properties from a Llama.cpp server instance.
 * Contains essential information about the server configuration and capabilities. [[9]]
 */
export interface LlamaCppServerProps {
  /** Build information of the server */
  build_info: string;
  /** Currently loaded model name/path */
  model: string;
  /** Maximum context length supported by the model */
  n_ctx: number;
  /** Modality support information for the model */
  modalities?: {
    /** Whether vision capabilities are supported */
    vision: boolean;
    /** Whether audio capabilities are supported */
    audio: boolean;
  };
  // TODO: support params
}

// --- Helper Functions ---

/**
 * Converts application message format to API-compatible message structure.
 * Processes extra content (context, files) and formats them according to API requirements.
 *
 * @param messages - Array of messages in application format to normalize
 * @returns Array of messages formatted for API consumption
 *
 * @remarks
 * This function processes extra content first, followed by the user message,
 * which allows for better cache prefix utilization with long context windows. [[3]]
 */
function normalizeMsgsForAPI(
  messages: Readonly<Message[]>
): InferenceApiMessage[] {
  return messages.map((msg) => {
    if (msg.role !== 'user' || !msg.extra) {
      return {
        role: msg.role,
        content: msg.content,
      };
    }

    // extra content first, then user text message in the end
    // this allow re-using the same cache prefix for long context
    const contentArr: InferenceApiMessageContentPart[] = [];

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
  });
}

/**
 * Filters out thinking process content from assistant messages.
 * Specifically removes content between <think> and </think> tags for DeepsSeek-R1 model compatibility.
 *
 * @param messages - API-formatted messages to process
 * @returns Messages with thinking process content removed from assistant responses
 *
 * @remarks
 * In development mode, this function logs the original messages for debugging purposes. [[7]]
 */
function filterThoughtFromMsgs(
  messages: InferenceApiMessage[]
): InferenceApiMessage[] {
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
    const splittedMessage = splitMessageContent(msg.content as string);
    return {
      role: msg.role,
      content: splittedMessage.content || '',
    };
  });
}

/**
 * Creates an async generator for processing Server-Sent Events (SSE) streams.
 * Handles parsing of event data and error conditions from the stream.
 *
 * @param fetchResponse - Response object from a fetch request expecting SSE
 * @returns Async generator yielding parsed event data
 *
 * @throws When encountering error messages in the stream
 *
 * @remarks
 * This implementation uses TextLineStream and asyncIterator ponyfill to handle
 * streaming responses in environments like Safari that lack native support. [[2]]
 */
async function* getSSEStreamAsync(fetchResponse: Response) {
  if (!fetchResponse.body) throw new Error('Response body is empty');
  const lines: ReadableStream<string> = fetchResponse.body
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream());
  // @ts-expect-error asyncIterator complains about type, but it should work
  for await (const line of asyncIterator(lines)) {
    //if (isDev) console.debug({ line });
    if (line.startsWith('data:') && !line.endsWith('[DONE]')) {
      const data = JSON.parse(line.slice(5));
      yield data;
    } else if (line.startsWith('error:')) {
      const data = JSON.parse(line.slice(6));
      throw new Error(data.message || 'Unknown error');
    }
  }
}

// --- Main Inference API Functions ---

/**
 * API provider class for interacting with Llama.cpp server endpoints.
 * Handles chat completions, model listing, and server property retrieval. [[1]]
 */
class InferenceApiProvider {
  /** Configuration settings for API interactions */
  config: Configuration;

  /**
   * Private constructor to enforce factory pattern usage
   *
   * @param config - API configuration settings
   */
  private constructor(config: Configuration) {
    this.config = config;
  }

  /**
   * Factory method to create new ApiProvider instances
   *
   * @param config - Configuration settings for the API provider
   * @returns New ApiProvider instance
   */
  static new(config: Configuration) {
    return new InferenceApiProvider(config);
  }

  /**
   * Retrieves server properties and capabilities from the Llama.cpp server.
   *
   * @returns Promise resolving to server properties object
   * @throws When the server request fails or returns non-OK status
   *
   * @remarks
   * In development mode, logs the server properties for debugging purposes. [[7]]
   */
  async getServerProps(): Promise<LlamaCppServerProps> {
    try {
  const response = await fetch(new URL('/props', this.config.baseUrl).toString(), {
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey
            ? { Authorization: `Bearer ${this.config.apiKey}` }
            : {}),
        },
        signal: AbortSignal.timeout(1000),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch server props');
      }
      const data = await response.json();
      if (isDev)
        console.debug('server props:\n', JSON.stringify(data, null, 2));
      return {
        build_info: data.build_info,
        model: data?.model_path
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

  /**
   * Sends chat messages to the API and processes the streaming response.
   * Handles message normalization, thought filtering, and parameter configuration.
   *
   * @param messages - Array of messages to send in the conversation
   * @param abortSignal - Signal to cancel the request
   * @returns Async generator yielding chat completion tokens/events
   *
   * @throws When the API returns a non-200 status or contains error data
   *
   * @remarks
   * This method supports advanced configuration options through the provider's
   * configuration object, including generation parameters and custom options. [[6]]
   */
  async v1ChatCompletions(
    messages: readonly Message[],
    abortSignal: AbortSignal
  ) {
    // prepare messages for API
    let apiMessages: InferenceApiMessage[] = [];
    if (this.config.systemMessage?.trim()) {
      apiMessages.push({
        role: 'system',
        content: this.config.systemMessage,
      });
    }
    apiMessages.push(...normalizeMsgsForAPI(messages));

    if (this.config.excludeThoughtOnReq) {
      apiMessages = filterThoughtFromMsgs(apiMessages);
    }

    if (isDev) console.debug('v1ChatCompletions', { messages: apiMessages });

    // prepare params
    let params = {
      model: !this.config.model ? null : this.config.model,
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
      new URL('/v1/chat/completions', this.config.baseUrl).toString(),
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(params),
        signal: abortSignal,
      }
    );
    await this.isErrorResponse(fetchResponse);
    return getSSEStreamAsync(fetchResponse);
  }

  /**
   * Retrieves the list of available models from the API.
   *
   * @returns Promise resolving to array of available models
   * @throws When the API returns a non-200 status or contains error data
   */
  async v1Models(): Promise<InferenceApiModel[]> {
  const fetchResponse = await fetch(new URL('/v1/models', this.config.baseUrl).toString(), {
      method: 'GET',
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(1000),
    });
    await this.isErrorResponse(fetchResponse);
    const json = await fetchResponse.json();
    const res: InferenceApiModel[] = [];
    if (json.data && Array.isArray(json.data)) {
      json.data.map((m: InferenceApiModel) => {
        res.push({
          id: m.id,
          name: m.name || m.id,
          created: m.created,
          description: m.description,
        });
      });
      res.sort((a, b) => {
        if (a.created || b.created) {
          return (b.created || 0) - (a.created || 0);
        }
        return a.name.localeCompare(b.name);
      });
    }
    return res;
  }

  /**
   * Generates appropriate headers for API requests, including authentication.
   *
   * @returns Headers configuration for fetch requests
   * @private
   */
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

  /**
   * Checks response for errors response.
   *
   * @throws Error if status is not Success
   * @private
   */
  private async isErrorResponse(response: Response) {
    if (response.status === 200) return;

    const body = await response.json();
    console.error('API error: ', body);
    if (response.status === 500) {
      throw new Error('Internal server error');
    }
    throw new Error(body?.error?.message || 'Unknown error');
  }
}

export default InferenceApiProvider;

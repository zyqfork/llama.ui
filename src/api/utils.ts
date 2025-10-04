import {
  Configuration,
  InferenceApiMessage,
  InferenceApiMessageContentPart,
  Message,
  SSEData,
  SSEMessage,
} from '../types';

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
export function normalizeMsgsForAPI(
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
 * Process SSE stream from Response object and return async generator
 */
export async function* processSSEStream<T = SSEData>(
  response: Response
): AsyncGenerator<T, void, undefined> {
  if (!response.body) {
    throw new Error('Response body is empty');
  }

  // Create a reader for the response body
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      // Split buffer into lines
      const lines = buffer.split('\n');
      // Keep the last incomplete line in buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() === '') continue;

        const sseMessage = parseSSELine(line);
        if (sseMessage) {
          if (sseMessage.type === 'data') {
            if (sseMessage.value === '[DONE]') {
              return; // End the stream
            }
            try {
              const parsedData = JSON.parse(sseMessage.value) as T;
              yield parsedData;
            } catch (error) {
              console.warn(
                'Failed to parse SSE data:',
                sseMessage.value,
                error
              );
              // Optionally throw error or continue
              continue;
            }
          } else if (sseMessage.type === 'error') {
            try {
              const errorData = JSON.parse(sseMessage.value);
              throw new Error(errorData.message || 'SSE Error occurred');
            } catch {
              throw new Error(sseMessage.value);
            }
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Parse individual SSE line
 */
function parseSSELine(line: string): SSEMessage | null {
  // Skip comment lines (lines starting with :)
  if (line.startsWith(':')) {
    return null;
  }

  // Find the first colon to separate field from value
  const colonIndex = line.indexOf(':');
  if (colonIndex === -1) {
    return null;
  }

  const field = line.substring(0, colonIndex).trim();
  const value = line.substring(colonIndex + 1).trim();

  // If the line starts with a colon (field is empty), it's a comment
  if (field === '') {
    return null;
  }

  switch (field.toLowerCase()) {
    case 'data':
      return { type: 'data', value };
    case 'event':
      return { type: 'event', value };
    case 'id':
      return { type: 'id', value };
    case 'retry':
      return { type: 'retry', value };
    case 'error':
      return { type: 'error', value };
    default:
      return null;
  }
}

export const noResponse = new Response(null, { status: 444 });

export const configToCustomOptions = (config: Configuration) => {
  // prepare params
  let params = {};

  if (config.overrideGenerationOptions)
    params = Object.assign(params, {
      temperature: config.temperature,
      top_k: config.top_k,
      top_p: config.top_p,
      min_p: config.min_p,
      max_tokens: config.max_tokens,
    });

  if (config.overrideSamplersOptions)
    params = Object.assign(params, {
      samplers: config.samplers,
      dynatemp_range: config.dynatemp_range,
      dynatemp_exponent: config.dynatemp_exponent,
      typical_p: config.typical_p,
      xtc_probability: config.xtc_probability,
      xtc_threshold: config.xtc_threshold,
    });

  if (config.overridePenaltyOptions)
    params = Object.assign(params, {
      repeat_last_n: config.repeat_last_n,
      repeat_penalty: config.repeat_penalty,
      presence_penalty: config.presence_penalty,
      frequency_penalty: config.frequency_penalty,
      dry_multiplier: config.dry_multiplier,
      dry_base: config.dry_base,
      dry_allowed_length: config.dry_allowed_length,
      dry_penalty_last_n: config.dry_penalty_last_n,
    });

  if (config.custom.trim().length) {
    try {
      params = Object.assign(params, JSON.parse(config.custom));
    } catch (e) {
      console.error('Failed to parse custom configuration:', e);
    }
  }

  return params;
};

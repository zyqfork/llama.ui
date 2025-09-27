import { isDev } from '../config';
import {
  ChatCompletionProvider,
  InferenceApiMessage,
  InferenceApiModel,
  LLMProvider,
  ModelProvider,
} from '../types';
import { normalizeUrl } from '../utils';
import { getSSEStreamAsync, noResponse } from './utils';

export class BaseOpenAIProvider
  implements LLMProvider, ModelProvider, ChatCompletionProvider
{
  private baseUrl: string;
  private apiKey: string;
  private models: InferenceApiModel[] = [];
  private lastUpdated;

  protected constructor(baseUrl: string, apiKey: string = '') {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.lastUpdated = Date.now();
  }

  static new(baseUrl: string, apiKey: string = '') {
    return new BaseOpenAIProvider(baseUrl, apiKey);
  }

  /**
   * Retrieves the list of available models from the API.
   *
   * @returns Promise resolving to array of available models
   * @throws When the API returns a non-200 status or contains error data
   */
  async getModels(): Promise<InferenceApiModel[]> {
    if (!this.models) {
      if (isDev) console.debug('v1Models');

      let fetchResponse = noResponse;
      try {
        fetchResponse = await fetch(
          normalizeUrl('/v1/models', this.getBaseUrl()),
          {
            method: 'GET',
            headers: this.getHeaders(),
            signal: AbortSignal.timeout(1000),
          }
        );
      } catch {
        // do nothing
      }
      await this.isErrorResponse(fetchResponse);
      const json = await fetchResponse.json();
      this.models = this.mapModels(json.data);

      this.lastUpdated = Date.now();
    }
    return this.models;
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
  async postChatCompletions(
    model: string,
    messages: readonly InferenceApiMessage[],
    abortSignal: AbortSignal,
    customOptions?: object
  ) {
    if (isDev) console.debug('v1ChatCompletions', { messages });

    // prepare params
    let params = {
      model,
      messages,
      stream: true,
      cache_prompt: true,
      timings_per_token: true,
    };

    // advanced options
    if (!customOptions) params = Object.assign(params, customOptions);

    // send request
    let fetchResponse = noResponse;
    try {
      fetchResponse = await fetch(
        normalizeUrl('/v1/chat/completions', this.getBaseUrl()),
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(params),
          signal: abortSignal,
        }
      );
    } catch {
      // do nothing
    }
    await this.isErrorResponse(fetchResponse);
    return getSSEStreamAsync(fetchResponse);
  }

  /**
   * Generates appropriate headers for API requests, including authentication.
   *
   * @returns Headers configuration for fetch requests
   * @private
   */
  protected getHeaders(): HeadersInit {
    const headers = {
      'Content-Type': 'application/json',
    };

    const apiKey = this.getApiKey();
    if (apiKey) {
      Object.assign(headers, {
        Authorization: `Bearer ${apiKey}`,
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
  protected async isErrorResponse(response: Response) {
    if (response.status === 200) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let body: any = {};
    try {
      body = await response.json();
    } catch (e) {
      // fallback if response is not JSON
      body = {};
    }

    if (Object.keys(body).length > 0) console.error('API error: ', body);

    switch (response.status) {
      case 400:
        throw new Error('Bad request');
      case 401:
        throw new Error('Unauthorized');
      case 402:
        throw new Error('Payment required');
      case 403:
        throw new Error('Forbidden');
      case 404:
        throw new Error('Not found');
      case 429:
        throw new Error('Too many requests');
      case 444:
        throw new Error('No response');
      case 500:
        throw new Error('Internal server error');
      case 502:
        throw new Error('Bad gateway');
      case 503:
        throw new Error('Service unavailable');
      case 504:
        throw new Error('Gateway timeout');
      default:
        throw new Error(
          body?.error?.message || `Unknown error: ${response.status}`
        );
    }
  }

  protected isExpired() {
    return Date.now() - this.lastUpdated > 60 * 1000;
  }

  protected mapModels(data: InferenceApiModel[]) {
    const res: InferenceApiModel[] = [];
    if (data && Array.isArray(data)) {
      data.map((m) => {
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

  getBaseUrl() {
    return this.baseUrl;
  }

  getApiKey() {
    return this.apiKey;
  }
}

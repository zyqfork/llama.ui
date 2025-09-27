import { InferenceApiModel, Modality } from '../../types';
import { BaseOpenAIProvider } from './BaseOpenAIProvider';

/**
 * Represents a model available via the OpenRouter API.
 *
 * @see https://openrouter.ai/docs/overview/models
 */
interface OpenRouterModel {
  id: string;
  name: string;
  created: number;
  description: string;
  architecture: Architecture;
  top_provider: TopProvider;
  pricing: Pricing;
  canonical_slug: string;
  context_length: number;
  hugging_face_id: string;
  supported_parameters: string[];
}

interface Architecture {
  input_modalities: Modality[];
  output_modalities: Modality[];
  tokenizer: string;
  instruct_type: string;
}

interface TopProvider {
  is_moderated: boolean;
  context_length: number;
  max_completion_tokens: number;
}

interface Pricing {
  prompt: string;
  completion: string;
  image: string;
  request: string;
  web_search: string;
  internal_reasoning: string;
  input_cache_read: string;
  input_cache_write: string;
}

/**
 * Provider implementation for interacting with the OpenRouter API.
 *
 * Extends `BaseOpenAIProvider` to leverage OpenAI-compatible request formatting
 * while adapting to OpenRouter-specific model metadata and endpoint structure.
 *
 * @see https://openrouter.ai/docs
 */
export class OpenRouterProvider extends BaseOpenAIProvider {
  /**
   * Creates a new instance of OpenRouterProvider with optional base URL and API key.
   *
   * @param baseUrl - Optional custom base URL for the OpenRouter API (defaults to OpenRouter's public endpoint)
   * @param apiKey - API key for authentication. Required for most endpoints.
   * @returns A new OpenRouterProvider instance
   */
  static new(baseUrl?: string, apiKey: string = ''): OpenRouterProvider {
    return new OpenRouterProvider(baseUrl, apiKey);
  }

  /**
   * Determines if the provider's model cache has expired.
   *
   * OpenRouter models are cached for 15 minutes to reduce API calls.
   * This method checks whether the last update time exceeds this threshold.
   *
   * @returns `true` if the cache has expired (>15 minutes since last update), otherwise `false`
   */
  protected isExpired(): boolean {
    return Date.now() - this.lastUpdated > 15 * 60 * 1000;
  }

  /**
   * Converts raw OpenRouter API model data into the standardized `InferenceApiModel` format.
   *
   * This method safely extracts and maps model metadata from the OpenRouter response schema
   * to the application's internal model representation.
   *
   * @param m - Raw model data received from OpenRouter API (unknown type for safety)
   * @returns A normalized `InferenceApiModel` object with id, name, created, description, and modalities
   * @throws Will throw if `m` is not a valid OpenRouterModel or required fields are missing
   */
  protected jsonToModel(m: unknown): InferenceApiModel {
    const model = m as OpenRouterModel;
    return {
      id: model.id,
      name: model.name,
      created: model.created,
      description: model.description,
      modalities: model.architecture.input_modalities || [],
      output_modalities: model.architecture.output_modalities || [],
    };
  }
}

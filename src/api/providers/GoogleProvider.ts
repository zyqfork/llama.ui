import { InferenceApiModel } from '../../types';
import { BaseOpenAIProvider } from './BaseOpenAIProvider';

/**
 * Represents a Google model metadata structure as returned by the API.
 *
 * @interface GoogleModel
 * @property {string} id - Unique identifier for the model.
 * @property {string} object - Object type, typically "model".
 * @property {string} owned_by - Owner of the model (e.g., organization or user).
 * @property {string} display_name - Human-readable name of the model for UI display.
 */
interface GoogleModel {
  id: string;
  object: string;
  owned_by: string;
  display_name: string;
}

/**
 * GoogleProvider extends BaseOpenAIProvider to handle Google's model API responses.
 *
 * This class adapts Google's model response format to the standard InferenceApiModel interface
 * used by the application. It implements a 15-minute cache expiration policy.
 *
 * @example
 * const provider = GoogleProvider.new('https://api.google.com', 'your-api-key');
 * const models = await provider.getModels();
 *
 * @class GoogleProvider
 * @extends BaseOpenAIProvider
 */
export class GoogleProvider extends BaseOpenAIProvider {
  /**
   * Creates a new instance of GoogleProvider with optional base URL and API key.
   *
   * This is a static factory method that provides a convenient way to construct
   * a GoogleProvider instance without using the constructor directly.
   *
   * @static
   * @param {string} [baseUrl] - Optional base URL for the Google API endpoint.
   *                             Defaults to the parent class's default if not provided.
   * @param {string} [apiKey=''] - API key for authentication. Required for actual API calls.
   * @returns {GoogleProvider} A new instance of GoogleProvider.
   *
   * @example
   * const provider = GoogleProvider.new(); // Uses default base URL and empty key
   * const provider = GoogleProvider.new('https://api.google.com/v1', 'my-key');
   */
  static new(baseUrl?: string, apiKey: string = ''): GoogleProvider {
    return new GoogleProvider(baseUrl, apiKey);
  }

  /** @inheritdoc */
  protected isExpired(): boolean {
    return Date.now() - this.lastUpdated > 15 * 60 * 1000;
  }

  /** @inheritdoc */
  protected isAllowCustomOptions(): boolean {
    return false;
  }

  /** @inheritdoc */
  protected isSupportCache(): boolean {
    return false;
  }

  /** @inheritdoc */
  protected isSupportTimings(): boolean {
    return false;
  }

  /** @inheritdoc */
  protected jsonToModel(m: unknown): InferenceApiModel {
    const model = m as GoogleModel;

    return {
      id: model.id,
      name: model.display_name,
    };
  }
}

import { InferenceProvider } from '../../types';
import { BaseOpenAIProvider } from './BaseOpenAIProvider';
import { GoogleProvider } from './GoogleProvider';
import { GroqProvider } from './GroqProvider';
import { LlamaCppProvider } from './LlamaCppProvider';
import { OpenRouterProvider } from './OpenRouterProvider';

const PROVIDER_CACHE = new Map<string, InferenceProvider>();

export function getInferenceProvider(
  key: string,
  baseUrl: string,
  apiKey: string = ''
): InferenceProvider {
  if (!baseUrl) throw new Error(`Base URL is not specified`);

  if (PROVIDER_CACHE.has(baseUrl)) {
    const provider = PROVIDER_CACHE.get(baseUrl)!;
    if (provider.getApiKey() === apiKey) {
      return PROVIDER_CACHE.get(baseUrl)!;
    }
  }

  let provider: InferenceProvider;
  switch (key) {
    case 'llama-cpp':
      provider = LlamaCppProvider.new(baseUrl, apiKey);
      break;
    case 'open-router':
      provider = OpenRouterProvider.new(baseUrl, apiKey);
      break;
    case 'google':
      provider = GoogleProvider.new(baseUrl, apiKey);
      break;
    case 'groq':
      provider = GroqProvider.new(baseUrl, apiKey);
      break;
    default:
      provider = BaseOpenAIProvider.new(baseUrl, apiKey);
  }

  PROVIDER_CACHE.set(baseUrl, provider);
  return provider;
}

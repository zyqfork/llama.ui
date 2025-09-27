import { InferenceProvider } from '../../types';
import { BaseOpenAIProvider } from './BaseOpenAIProvider';
import { LlamaCppProvider } from './LlamaCppProvider';

export function getInferenceProvider(
  key: string,
  baseUrl?: string,
  apiKey?: string
): InferenceProvider {
  switch (key) {
    case 'llama-cpp':
      return LlamaCppProvider.new(baseUrl, apiKey);
    default:
      return BaseOpenAIProvider.new(baseUrl, apiKey);
  }
}

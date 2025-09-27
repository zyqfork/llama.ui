import { InferenceApiMessage, InferenceApiModel } from './inference';

export interface LLMProvider {
  getBaseUrl(): string;
  getApiKey(): string | undefined;
}

export interface ModelProvider {
  getModels(): Promise<InferenceApiModel[]>;
}

export interface ChatCompletionProvider {
  postChatCompletions(
    model: string,
    messages: readonly InferenceApiMessage[],
    abortSignal: AbortSignal,
    customOptions?: object
  ): Promise<AsyncGenerator<unknown, void, unknown>>;
}

export interface InferenceProvider
  extends ModelProvider,
    ChatCompletionProvider {}

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<AsyncGenerator<any, void, unknown>>;
}

export interface InferenceProvider
  extends LLMProvider,
    ModelProvider,
    ChatCompletionProvider {}

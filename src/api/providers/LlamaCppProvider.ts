import { isDev } from '../../config';
import { InferenceApiModel, LlamaCppServerProps } from '../../types';
import { normalizeUrl } from '../../utils';
import { noResponse } from '../utils';
import { BaseOpenAIProvider } from './BaseOpenAIProvider';

export class LlamaCppProvider extends BaseOpenAIProvider {
  static new(baseUrl?: string, apiKey: string = '') {
    return new LlamaCppProvider(baseUrl, apiKey);
  }

  protected jsonToModels(data: InferenceApiModel[]) {
    const res: InferenceApiModel[] = [];
    if (data && Array.isArray(data)) {
      data.map((m) => {
        res.push({
          id: m.id,
          name: m.id,
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
   * Retrieves server properties and capabilities from the Llama.cpp server.
   *
   * @returns Promise resolving to server properties object
   * @throws When the server request fails or returns non-OK status
   *
   * @remarks
   * In development mode, logs the server properties for debugging purposes. [[7]]
   */
  async getServerProps(): Promise<LlamaCppServerProps> {
    let fetchResponse = noResponse;
    try {
      fetchResponse = await fetch(normalizeUrl('/props', this.getBaseUrl()), {
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(1000),
      });
    } catch {
      // do nothing
    }
    await this.isErrorResponse(fetchResponse);
    const data = await fetchResponse.json();
    if (isDev) console.debug('server props:\n', JSON.stringify(data, null, 2));
    return {
      build_info: data.build_info,
      model: data?.model_path
        ?.split(/(\\|\/)/)
        .pop()
        ?.replace(/[-](?:[\d\w]+[_\d\w]+)(?:\.[a-z]+)?$/, ''),
      n_ctx: data.n_ctx,
      modalities: data?.modalities,
    };
  }
}

import { create } from 'zustand';
import toast from 'react-hot-toast';
import { CONFIG_DEFAULT, INFERENCE_PROVIDERS, isDev } from '../config';
import InferenceApi, {
  InferenceApiModel,
  LlamaCppServerProps,
} from '../utils/inferenceApi';
import { Configuration } from '../utils/types';

// --- Type Definitions ---

type FetchOptions = {
  silent?: boolean;
};

interface InferenceState {
  api: InferenceApi;
  models: InferenceApiModel[];
  serverProps: LlamaCppServerProps;

  fetchModels: (
    config: Configuration,
    options?: FetchOptions
  ) => Promise<InferenceApiModel[]>;

  fetchServerProperties: (
    config: Configuration,
    options?: FetchOptions
  ) => Promise<LlamaCppServerProps>;

  syncServer: (config: Configuration, options?: FetchOptions) => Promise<void>;

  updateApi: (config: Configuration) => void;
  setModels: (models: InferenceApiModel[]) => void;
  setServerProps: (props: LlamaCppServerProps) => void;
}

// --- Constants ---

const noModels: InferenceApiModel[] = [];
const noServerProps: LlamaCppServerProps = {
  build_info: '',
  model: '',
  n_ctx: 0,
  modalities: {
    vision: false,
    audio: false,
  },
};

// --- Helper Functions ---

function isProviderReady(config: Configuration): boolean {
  if (!config.provider) return false;

  const providerInfo = INFERENCE_PROVIDERS[config.provider];
  if (!providerInfo) return true;

  return (
    !!config.baseUrl && (!providerInfo.isKeyRequired || config.apiKey !== '')
  );
}

export const useInferenceStore = create<InferenceState>((set, get) => ({
  api: InferenceApi.new(CONFIG_DEFAULT),
  models: noModels,
  serverProps: noServerProps,

  updateApi: (config: Configuration) => {
    if (isDev) console.debug('Update Inference API');
    const newApi = InferenceApi.new(config);
    set({ api: newApi });
  },

  setModels: (models) => set({ models }),
  setServerProps: (props) => set({ serverProps: props }),

  fetchModels: async (config, options = {}) => {
    if (!isProviderReady(config)) return noModels;

    if (isDev) console.debug('Fetch models');
    const newApi = InferenceApi.new(config);
    let newModels = noModels;
    try {
      newModels = await newApi.v1Models();
      set({ models: newModels, api: newApi });
    } catch (err) {
      if (!options.silent) {
        console.error('fetch models failed: ', err);
        toast.error(`Inference Provider: ${(err as Error).message}.`);
      }
    }
    return newModels;
  },

  fetchServerProperties: async (config, options = {}) => {
    if (config.provider !== 'llama-cpp' || !isProviderReady(config)) {
      return noServerProps;
    }

    if (isDev) console.debug('Fetch server properties');
    const newApi = InferenceApi.new(config);
    let newProps = noServerProps;
    try {
      newProps = await newApi.getServerProps();
      set({ serverProps: newProps });
    } catch (err) {
      if (!options.silent) {
        console.error('fetch llama.cpp props failed: ', err);
      }
    }
    return newProps;
  },

  syncServer: async (config, options = {}) => {
    const { fetchModels, fetchServerProperties } = get();

    if (!config.baseUrl) return;
    if (isDev) console.debug('Update inference model list');

    await fetchModels(config, options);
    await fetchServerProperties(config, options);
  },
}));

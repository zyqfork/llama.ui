import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CONFIG_DEFAULT, INFERENCE_PROVIDERS, isDev } from '../config';
import InferenceApi, {
  InferenceApiModel,
  LlamaCppServerProps,
} from '../utils/inferenceApi';
import { Configuration } from '../utils/types';
import { useAppContext } from './app.context';

// --- Type Definitions ---

type FetchOptions = {
  silent: boolean;
};

interface InferenceContextValue {
  api: InferenceApi;
  models: InferenceApiModel[];
  serverProps: LlamaCppServerProps;

  fetchModels: (
    config: Configuration,
    options?: FetchOptions
  ) => Promise<InferenceApiModel[]>;
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

const InferenceContext = createContext<InferenceContextValue>({
  api: InferenceApi.new(CONFIG_DEFAULT),
  models: noModels,
  serverProps: noServerProps,
  fetchModels: () => new Promise(() => noModels),
});

// --- Helper Functions ---

function isProviderReady(config: Configuration) {
  if (!config.provider) return false;

  const providerInfo = INFERENCE_PROVIDERS[config.provider];
  if (!providerInfo) return true;

  return (
    !!config.baseUrl && (!providerInfo.isKeyRequired || config.apiKey !== '')
  );
};

export const InferenceContextProvider = ({
  children,
}: {
  children: React.ReactElement;
}) => {
  const { config } = useAppContext();
  const [api, setApi] = useState<InferenceApi>(InferenceApi.new(config));
  const [models, setModels] = useState<InferenceApiModel[]>(noModels);
  const [serverProps, setServerProps] =
    useState<LlamaCppServerProps>(noServerProps);

  useEffect(() => {
    if (!config) return;
    if (isDev) console.debug('Update Inference API');
    const newApi = InferenceApi.new(config);
    setApi(newApi);
  }, [config]);

  const { baseUrl, apiKey } = config;
  useEffect(() => {
    if (!baseUrl) return;
    if (isDev) console.debug('Update inference model list');
    const syncServer = async (config: Configuration) => {
      setModels(await fetchModels(config));
      setServerProps(await fetchServerProperties(config));
    };
    syncServer(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl, apiKey]);

  // --- Main Functions ---

  const fetchModels = async (
    config: Configuration,
    options: FetchOptions = { silent: false }
  ): Promise<InferenceApiModel[]> => {
    if (!isProviderReady(config)) {
      return noModels;
    }

    if (isDev) console.debug('Fetch models');
    const newApi = InferenceApi.new(config);
    let newModels = noModels;
    try {
      newModels = await newApi.v1Models();
    } catch (err) {
      if (!options.silent) {
        console.error('fetch models failed: ', err);
        toast.error(`Inference Provider: ${(err as Error).message}.`);
      }
    }
    return newModels;
  };

  const fetchServerProperties = async (
    config: Configuration,
    options: FetchOptions = { silent: false }
  ): Promise<LlamaCppServerProps> => {
    if (config.provider !== 'llama-cpp' || !isProviderReady(config)) {
      return noServerProps;
    }

    if (isDev) console.debug('Fetch server properties');
    const newApi = InferenceApi.new(config);
    let newProps = noServerProps;
    try {
      newProps = await newApi.getServerProps();
    } catch (err) {
      if (!options.silent) {
        console.error('fetch llama.cpp props failed: ', err);
      }
    }
    return newProps;
  };

  return (
    <InferenceContext.Provider
      value={{ api, models, serverProps, fetchModels }}
    >
      {children}
    </InferenceContext.Provider>
  );
};

export const useInferenceContext = () => {
  const context = useContext(InferenceContext);
  if (!context) {
    throw new Error(
      'useInferenceContext must be used within an InferenceContextProvider'
    );
  }
  return context;
};

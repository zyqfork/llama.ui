import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CONFIG_DEFAULT, INFERENCE_PROVIDERS } from '../config';
import InferenceApi, {
  InferenceApiModel,
  LlamaCppServerProps,
} from '../utils/inferenceApi';
import { Configuration } from '../utils/types';
import { useAppContext } from './app.context';

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
  ) => Promise<boolean>;
}

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
  fetchModels: () => new Promise(() => false),
});

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

  const isProviderReady = (config: Configuration) => {
    if (!config.provider) return false;

    const providerInfo = INFERENCE_PROVIDERS[config.provider];
    if (!providerInfo) return true;

    return (
      !!config.baseUrl && (!providerInfo.isKeyRequired || config.apiKey !== '')
    );
  };

  useEffect(() => {
    const newApi = InferenceApi.new(config);
    setApi(newApi);
    const syncServer = async (config: Configuration) => {
      await fetchModels(config);
      await fetchServerProperties(config);
    };
    syncServer(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  const fetchModels = async (
    config: Configuration,
    options: FetchOptions = { silent: false }
  ) => {
    if (!isProviderReady(config)) {
      setModels(noModels);
      return false;
    }

    const newApi = InferenceApi.new(config);
    try {
      const newModels = await newApi.v1Models();
      setModels(newModels);
    } catch (err) {
      setModels(noModels);
      if (!options.silent) {
        console.error('fetch models failed: ', err);
        toast.error('Inference server is unavailable, check Settings.');
      }
      return false;
    }
    return true;
  };

  const fetchServerProperties = async (
    config: Configuration,
    options: FetchOptions = { silent: false }
  ) => {
    if (config.provider !== 'llama-cpp' || !isProviderReady(config)) {
      setServerProps(noServerProps);
      return false;
    }

    const newApi = InferenceApi.new(config);
    try {
      setServerProps(await newApi.getServerProps());
    } catch (err) {
      setServerProps(noServerProps);
      if (!options.silent) {
        console.error('fetch llama.cpp props failed: ', err);
      }
    }
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

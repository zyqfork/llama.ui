import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CONFIG_DEFAULT } from '../config';
import { useAppContext } from './app.context';
import InferenceApi, {
  InferenceApiModel,
  LlamaCppServerProps,
} from './inferenceApi';
import providersData from './providers.json';
import { Configuration } from './types';

type FetchOptions = {
  silent: boolean;
};

interface InferenceContextValue {
  api: InferenceApi;
  models: InferenceApiModel[];
  serverProps: LlamaCppServerProps | null;

  fetchModels: (
    config: Configuration,
    options?: FetchOptions
  ) => Promise<boolean>;
}

const InferenceContext = createContext<InferenceContextValue>({
  api: InferenceApi.new(CONFIG_DEFAULT),
  models: [],
  serverProps: null,
  fetchModels: () => new Promise(() => false),
});

export const InferenceContextProvider = ({
  children,
}: {
  children: React.ReactElement;
}) => {
  const { config } = useAppContext();
  const [api, setApi] = useState<InferenceApi>(InferenceApi.new(config));
  const [models, setModels] = useState<InferenceApiModel[]>([]);
  const [serverProps, setServerProps] = useState<LlamaCppServerProps | null>(
    null
  );

  const isProviderReady = (config: Configuration) => {
    if (!config.provider) return false;

    const providerInfo =
      providersData[config.provider as keyof typeof providersData];
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
  }, [config]);

  useEffect(() => {
    if (models.length > 0) CONFIG_DEFAULT.model = models[0].id;
    else CONFIG_DEFAULT.model = '';
  }, [models]);

  const fetchModels = async (
    config: Configuration,
    options: FetchOptions = { silent: false }
  ) => {
    if (!isProviderReady(config)) return false;
    const newApi = InferenceApi.new(config);
    try {
      const newModels = await newApi.v1Models();
      setModels(newModels);
    } catch (err) {
      if (!options.silent) {
        console.error('fetch models failed: ', err);
        toast.error('LLM inference server is unavailable.');
      }
      return false;
    }
    return true;
  };

  const fetchServerProperties = async (
    config: Configuration,
    options: FetchOptions = { silent: false }
  ) => {
    if (config.provider !== 'llama-cpp') return;
    if (!isProviderReady(config)) return false;

    const newApi = InferenceApi.new(config);
    try {
      setServerProps(await newApi.getServerProps());
    } catch (err) {
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

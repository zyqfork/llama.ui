import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CONFIG_DEFAULT } from '../config';
import InferenceApi, { InferenceApiModel } from './inferenceApi';
import { useAppContext } from './app.context';
import providersData from './providers.json';
import { Configuration } from './types';

interface InferenceContextValue {
  api: InferenceApi;
  models: InferenceApiModel[];

  fetchModels: (config: Configuration) => Promise<boolean>;
}

const InferenceContext = createContext<InferenceContextValue>({
  api: InferenceApi.new(CONFIG_DEFAULT),
  models: [],
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
    fetchModels(config);
  }, [config]);

  useEffect(() => {
    if (models.length > 0) CONFIG_DEFAULT.model = models[0].id;
    else CONFIG_DEFAULT.model = '';
  }, [models]);

  const fetchModels = async (config: Configuration) => {
    if (!isProviderReady(config)) return false;
    const newApi = InferenceApi.new(config);
    try {
      const newModels = await newApi.v1Models();
      setModels(newModels);
    } catch (err) {
      console.error('fetch models failed: ', err);
      toast.error('LLM inference server is unavailable.');
      return false;
    }
    return true;
  };

  return (
    <InferenceContext.Provider value={{ api, models, fetchModels }}>
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

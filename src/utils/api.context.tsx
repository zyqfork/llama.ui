import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CONFIG_DEFAULT } from '../config';
import Api, { APIModel } from './api';
import { useAppContext } from './app.context';
import providersData from './providers.json';
import { Configuration } from './types';

interface ApiContextValue {
  api: Api;
  models: APIModel[];

  fetchModels: (config: Configuration) => Promise<boolean>;
}

const ApiContext = createContext<ApiContextValue>({
  api: Api.new(CONFIG_DEFAULT),
  models: [],
  fetchModels: () => new Promise(() => false),
});

export const ApiContextProvider = ({
  children,
}: {
  children: React.ReactElement;
}) => {
  const { config } = useAppContext();
  const [api, setApi] = useState<Api>(Api.new(config));
  const [models, setModels] = useState<APIModel[]>([]);

  const isProviderReady = (config: Configuration) => {
    if (!config.provider) return false;

    const providerInfo =
      providersData[config.provider as keyof typeof providersData];
    if (!providerInfo) return true;

    return (
      !!config.baseUrl && providerInfo.isKeyRequired && config.apiKey !== ''
    );
  };

  useEffect(() => {
    const newApi = Api.new(config);
    setApi(newApi);
    fetchModels(config);
  }, [config]);

  useEffect(() => {
    if (models.length > 0) CONFIG_DEFAULT.model = models[0].id;
    else CONFIG_DEFAULT.model = '';
  }, [models]);

  const fetchModels = async (config: Configuration) => {
    if (!isProviderReady(config)) return false;
    const newApi = Api.new(config);
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
    <ApiContext.Provider value={{ api, models, fetchModels }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApiContext = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApiContext must be used within an ApiContextProvider');
  }
  return context;
};

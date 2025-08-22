import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CONFIG_DEFAULT } from '../config';
import Api, { APIModel, LlamaCppServerProps } from './api';
import { useAppContext } from './app.context';

interface ApiContextValue {
  api: Api;
  models: APIModel[];
  serverProps: LlamaCppServerProps | null;
}

const ApiContext = createContext<ApiContextValue>({
  api: Api.new(CONFIG_DEFAULT),
  models: [],
  serverProps: null,
});

export const ApiContextProvider = ({
  children,
}: {
  children: React.ReactElement;
}) => {
  const { config } = useAppContext();
  const [api, setApi] = useState<Api>(Api.new(config));
  const [models, setModels] = useState<APIModel[]>([]);
  const [serverProps, setServerProps] = useState<LlamaCppServerProps | null>(
    null
  );

  useEffect(() => {
    const newApi = Api.new(config);
    setApi(newApi);

    const syncServer = async (api: Api) => {
      try {
        setModels(await api.v1Models());
      } catch (err) {
        console.error('fetch models failed: ', err);
        toast.error('LLM inference server is unavailable.');
        return;
      }
      try {
        setServerProps(await api.getServerProps());
      } catch (err) {
        /* TODO make better ignoring for not llama.cpp server */
      }
    };
    syncServer(newApi);
  }, [config]);

  useEffect(() => {
    if (models.length > 0) CONFIG_DEFAULT.model = models[0].id;
    else CONFIG_DEFAULT.model = '';
  }, [models]);

  return (
    <ApiContext.Provider value={{ api, models, serverProps }}>
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

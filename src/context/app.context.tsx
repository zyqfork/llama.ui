import React, { createContext, useContext, useEffect, useState } from 'react';
import { CONFIG_DEFAULT, isDev } from '../config';
import StorageUtils from '../utils/storage';
import { Configuration } from '../utils/types';

interface AppContextValue {
  config: Configuration;
  saveConfig: (config: Configuration) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
}

const AppContext = createContext<AppContextValue>({
  config: {} as Configuration,
  saveConfig: () => {},
  showSettings: false,
  setShowSettings: () => {},
});

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactElement;
}) => {
  const [config, setConfig] = useState<Configuration>(CONFIG_DEFAULT);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  useEffect(() => {
    if (isDev) console.debug('Load config');
    setConfig(StorageUtils.getConfig());
  }, []);

  const saveConfig = (config: Configuration) => {
    if (isDev) console.debug('Save config', config);
    StorageUtils.setConfig(config);
    setConfig(config);
  };

  return (
    <AppContext.Provider
      value={{
        config,
        saveConfig,
        showSettings,
        setShowSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};

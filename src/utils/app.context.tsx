import React, { createContext, useContext, useState } from 'react';
import StorageUtils from './storage';
import { CanvasData, Configuration } from './types';

interface AppContextValue {
  // canvas
  canvasData: CanvasData | null;
  setCanvasData: (data: CanvasData | null) => void;

  // config
  config: Configuration;
  saveConfig: (config: Configuration) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
}

const AppContext = createContext<AppContextValue>({
  canvasData: null,
  setCanvasData: () => {},
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
  const [config, setConfig] = useState(StorageUtils.getConfig());
  const [canvasData, setCanvasData] = useState<CanvasData | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const saveConfig = (config: Configuration) => {
    StorageUtils.setConfig(config);
    setConfig(config);
  };

  return (
    <AppContext.Provider
      value={{
        canvasData,
        setCanvasData,
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

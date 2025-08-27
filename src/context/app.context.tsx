import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CONFIG_DEFAULT, isDev } from '../config';
import StorageUtils from '../utils/storage';
import { Configuration, ConfigurationPreset } from '../utils/types';

interface AppContextValue {
  config: Configuration;
  saveConfig: (config: Configuration) => void;
  presets: ConfigurationPreset[];
  savePreset: (name: string, config: Configuration) => Promise<void>;
  removePreset: (name: string) => Promise<void>;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
}

const AppContext = createContext<AppContextValue>({
  config: {} as Configuration,
  saveConfig: () => {},
  presets: [],
  savePreset: () => new Promise(() => {}),
  removePreset: () => new Promise(() => {}),
  showSettings: false,
  setShowSettings: () => {},
});

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactElement;
}) => {
  const [config, setConfig] = useState<Configuration>(CONFIG_DEFAULT);
  const [presets, setPresets] = useState<ConfigurationPreset[]>([]);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      if (isDev) console.debug('Load config');
      setConfig(StorageUtils.getConfig());

      if (isDev) console.debug('Load presets');
      setPresets(await StorageUtils.getPresets());
    };
    init();
  }, []);

  const saveConfig = (config: Configuration) => {
    if (isDev) console.debug('Save config', config);
    StorageUtils.setConfig(config);
    setConfig(config);
  };

  const savePreset = async (name: string, config: Configuration) => {
    if (isDev) console.debug('Save preset', { name, config });
    StorageUtils.savePreset(name, config);
    setPresets(await StorageUtils.getPresets());
    toast.success('Preset is saved successfully');
  };

  const removePreset = async (name: string) => {
    if (isDev) console.debug('Remove preset', name);
    StorageUtils.removePreset(name);
    setPresets(await StorageUtils.getPresets());
    toast.success('Preset is removed successfully');
  };

  return (
    <AppContext.Provider
      value={{
        config,
        saveConfig,
        presets,
        savePreset,
        removePreset,
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

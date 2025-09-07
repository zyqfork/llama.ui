import daisyuiThemes from 'daisyui/theme/object';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import toast from 'react-hot-toast';
import usePrefersColorScheme from '../components/usePrefersColorScheme';
import { CONFIG_DEFAULT } from '../config';
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
  currentTheme: string;
  switchTheme: (theme: string) => void;
  colorScheme: string;
}

const AppContext = createContext<AppContextValue>({
  config: {} as Configuration,
  saveConfig: () => {},
  presets: [],
  savePreset: () => new Promise(() => {}),
  removePreset: () => new Promise(() => {}),
  showSettings: false,
  setShowSettings: () => {},
  currentTheme: 'auto',
  switchTheme: () => {},
  colorScheme: 'light',
});

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactElement;
}) => {
  const [config, setConfig] = useState<Configuration>(CONFIG_DEFAULT);
  const [presets, setPresets] = useState<ConfigurationPreset[]>([]);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [currentTheme, setCurrentTheme] = useState<string>(
    StorageUtils.getTheme()
  );

  // --- Main Functions ---

  const init = useCallback(async (): Promise<boolean> => {
    console.debug('Load config & presets');
    const config = StorageUtils.getConfig();
    setConfig(config);

    const presets = await StorageUtils.getPresets();
    setPresets(presets);
    return !!config;
  }, []);

  const saveConfig = (config: Configuration) => {
    console.debug('Save config', config);
    setConfig(() => {
      StorageUtils.setConfig(config);
      return config;
    });
  };

  const savePreset = async (name: string, config: Configuration) => {
    console.debug('Save preset', { name, config });
    await StorageUtils.savePreset(name, config);
    setPresets(await StorageUtils.getPresets());
    toast.success('Preset is saved successfully');
  };

  const removePreset = async (name: string) => {
    console.debug('Remove preset', name);
    await StorageUtils.removePreset(name);
    setPresets(await StorageUtils.getPresets());
    toast.success('Preset is removed successfully');
  };

  // --- DaisyUI Theme ---

  const switchTheme = (theme: string) => {
    console.debug('Switch theme', theme);
    StorageUtils.setTheme(theme);
    setCurrentTheme(theme);

    // Update body color scheme
    document.body.setAttribute('data-theme', theme);
    document.body.setAttribute(
      'data-color-scheme',
      daisyuiThemes[theme]?.['color-scheme'] ?? 'auto'
    );

    // Update <meta name="theme-color" />
    if (document.getElementsByClassName('bg-base-300').length > 0) {
      const color = window
        .getComputedStyle(document.getElementsByClassName('bg-base-300')[0])
        .getPropertyValue('background-color');
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', color);
    }
  };

  // --- Initialization ---

  useEffect(() => {
    init();
  }, [init]);

  const { colorScheme } = usePrefersColorScheme();

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
        currentTheme,
        switchTheme,
        colorScheme,
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

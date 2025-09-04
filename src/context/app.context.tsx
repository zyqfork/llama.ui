import { create } from 'zustand';
import toast from 'react-hot-toast';
import daisyuiThemes from 'daisyui/theme/object';
import { CONFIG_DEFAULT, isDev } from '../config';
import StorageUtils from '../utils/storage';
import { Configuration, ConfigurationPreset } from '../utils/types';
import { useInferenceStore } from './inference.context';

interface AppStore {
  config: Configuration;
  presets: ConfigurationPreset[];
  showSettings: boolean;
  currentTheme: string;

  saveConfig: (config: Configuration) => void;
  savePreset: (name: string, config: Configuration) => Promise<void>;
  removePreset: (name: string) => Promise<void>;
  setShowSettings: (show: boolean) => void;
  switchTheme: (theme: string) => void;
  init: () => Promise<void>;
}

export const useAppStore = create<AppStore>((set, get) => ({
  config: CONFIG_DEFAULT,
  presets: [],
  showSettings: false,
  currentTheme: StorageUtils.getTheme(),

  setShowSettings: (show: boolean) => {
    set({ showSettings: show });
  },

  // --- Initialization ---

  init: async () => {
    if (isDev) console.debug('Load config & presets');
    const config = StorageUtils.getConfig();
    const presets = await StorageUtils.getPresets();
    set({ config, presets });
  },

  // --- DaisyUI Theme ---

  switchTheme: (currentTheme: string) => {
    if (isDev) console.debug('Switch theme', currentTheme);
    StorageUtils.setTheme(currentTheme);
    set({ currentTheme });

    // Update body color scheme
    document.body.setAttribute('data-theme', currentTheme);
    document.body.setAttribute(
      'data-color-scheme',
      daisyuiThemes[currentTheme]?.['color-scheme'] ?? 'auto'
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
  },

  saveConfig: (config: Configuration) => {
    const { config: prevConfig } = get();

    if (isDev) console.debug('Save config', config);

    useInferenceStore.getState().updateApi(config);
    if (
      config.baseUrl !== prevConfig.baseUrl ||
      config.apiKey !== prevConfig.apiKey
    ) {
      useInferenceStore.getState().syncServer(config);
    }

    StorageUtils.setConfig(config);
    set({ config });
  },

  savePreset: async (name: string, config: Configuration) => {
    if (isDev) console.debug('Save preset', { name, config });
    await StorageUtils.savePreset(name, config);
    const presets = await StorageUtils.getPresets();
    set({ presets });
    toast.success('Preset is saved successfully');
  },

  removePreset: async (name: string) => {
    if (isDev) console.debug('Remove preset', name);
    await StorageUtils.removePreset(name);
    const presets = await StorageUtils.getPresets();
    set({ presets });
    toast.success('Preset is removed successfully');
  },
}));

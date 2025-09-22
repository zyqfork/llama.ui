import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { isDev } from '../config';

import en from './en.json';

export const SUPPORTED_LANGUAGES = [
  { key: 'en', name: 'English', label: 'English' },
  { key: 'zh', name: 'Chinese', label: '中文' },
  { key: 'hi', name: 'Hindi', label: 'हिन्दी' },
  { key: 'es', name: 'Spanish', label: 'Español' },
  { key: 'fr', name: 'French', label: 'Français' },
  { key: 'ru', name: 'Russian', label: 'Русский' },
  { key: 'pt', name: 'Portuguese', label: 'Português' },
  { key: 'de', name: 'German', label: 'Deutsch' },
  { key: 'ja', name: 'Japanese', label: '日本語' },
  { key: 'ko', name: 'Korean', label: '한국어' },
  { key: 'it', name: 'Italian', label: 'Italiano' },
  { key: 'ar', name: 'Arabic', label: 'اَلْعَرَبِيَّةُ' },
];

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  debug: isDev,
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: {
      translation: en,
    },
  },
});

export default i18n;

import daisyuiThemes from 'daisyui/theme/object';
import { Configuration } from './utils/types';

export const isDev = import.meta.env.MODE === 'development';

// constants
const baseUrl = new URL('.', document.baseURI).href
  .toString()
  .replace(/\/$/, '');

export const CONFIG_DEFAULT: Configuration = {
  // Note: in order not to introduce breaking changes, please keep the same data type (number, string, etc) if you want to change the default value. Do not use null or undefined for default value.
  // Do not use nested objects, keep it single level. Prefix the key if you need to group them.
  baseUrl: baseUrl,
  apiKey: '',
  systemMessage: '',
  showTokensPerSecond: false,
  showThoughtInProgress: false,
  excludeThoughtOnReq: true,
  pasteLongTextToFileLen: 10000,
  pdfAsImage: false,
  // make sure these default values are in sync with `common.h`
  samplers: 'edkypmxt',
  temperature: 0.8,
  dynatemp_range: 0.0,
  dynatemp_exponent: 1.0,
  top_k: 40,
  top_p: 0.95,
  min_p: 0.05,
  xtc_probability: 0.0,
  xtc_threshold: 0.1,
  typical_p: 1.0,
  repeat_last_n: 64,
  repeat_penalty: 1.0,
  presence_penalty: 0.0,
  frequency_penalty: 0.0,
  dry_multiplier: 0.0,
  dry_base: 1.75,
  dry_allowed_length: 2,
  dry_penalty_last_n: -1,
  max_tokens: -1,
  custom: '', // custom json-stringified object

  // experimental features
  pyIntepreterEnabled: false,
};

// list of themes supported by daisyui
export const THEMES = ['light', 'dark']
  // make sure light & dark are always at the beginning
  .concat(
    Object.keys(daisyuiThemes).filter((t) => t !== 'light' && t !== 'dark')
  );

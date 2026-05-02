import { rulesDisabledForVueAstroAndSvelteFiles } from './constants.js';

// Some type helpers for better type inference
type LegacyConfig = {
  rules?: Record<string, 'off'>;
  overrides?: {
    files: string[];
    excludedFiles?: string[];
    rules?: Record<string, 'off'>;
  }[];
};

type FlatConfig = {
  name?: string;
  rules?: Record<string, 'off'>;
  ignores?: string[];
};

// for eslint legacy configuration
export const overrideDisabledRulesForVueAndSvelteFiles = <C extends LegacyConfig>(config: C): C => {
  const foundRules = Object.keys(config.rules!).filter((rule) =>
    rulesDisabledForVueAstroAndSvelteFiles.includes(rule)
  );

  if (foundRules.length === 0) {
    return config;
  }

  const newConfig = structuredClone(config);

  newConfig.overrides = [
    {
      // classic configs use glob syntax
      files: ['*.*'],
      excludedFiles: ['*.vue', '*.svelte', '*.astro'],
      rules: {},
    },
  ];

  for (const rule of foundRules) {
    delete newConfig.rules![rule];
    newConfig.overrides[0].rules![rule] = 'off';
  }

  return newConfig;
};

export type SplittedFlatConfig<C extends FlatConfig> = [C] | [C, FlatConfig];

// for eslint flat configuration
export const splitDisabledRulesForVueAstroAndSvelteFiles = <C extends FlatConfig>(
  config: C
): SplittedFlatConfig<C> => {
  const foundRules = Object.keys(config.rules!).filter((rule) =>
    rulesDisabledForVueAstroAndSvelteFiles.includes(rule)
  );

  if (foundRules.length === 0) {
    return [config];
  }

  const oldConfig = structuredClone(config);

  const newConfig: FlatConfig = {
    // flat configs use minimatch syntax
    name: 'oxlint/vue-svelte-astro-exceptions',
    ignores: ['**/*.vue', '**/*.svelte', '**/*.astro'],
    rules: {},
  };

  for (const rule of foundRules) {
    delete oldConfig.rules![rule];
    newConfig.rules![rule] = 'off';
  }

  return [oldConfig, newConfig];
};

export const splitDisabledRulesForVueAstroAndSvelteFilesDeep = <
  T extends Record<string, FlatConfig>,
>(
  config: T
): { [K in keyof T]: SplittedFlatConfig<T[K]> } => {
  const result = {} as { [K in keyof T]: SplittedFlatConfig<T[K]> };

  for (const name in config) {
    result[name] = splitDisabledRulesForVueAstroAndSvelteFiles(config[name]);
  }

  return result;
};

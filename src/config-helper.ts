import { rulesDisabledForVueAndSvelteFiles } from './constants.js';

type expectedConfig = {
  name?: string;
  plugins?: string[];
  files?: string[];
  rules: Record<string, 'off'>;
  overrides?: expectedConfig[];
};

// for eslint legacy configuration
export const overrideDisabledRulesForVueAndSvelteFiles = (
  config: expectedConfig
): expectedConfig => {
  const foundRules = Object.keys(config.rules).filter((rule) =>
    rulesDisabledForVueAndSvelteFiles.includes(rule)
  );

  if (foundRules.length === 0) {
    return config;
  }

  const newConfig = structuredClone(config);

  newConfig.overrides = [
    {
      // classic configs use glob syntax
      files: ['!*.vue', '!*.svelte'],
      rules: {},
    },
  ];

  for (const rule of foundRules) {
    delete newConfig.rules[rule];
    newConfig.overrides[0].rules[rule] = 'off';
  }

  return newConfig;
};

// for eslint flat configuration
export const splitDisabledRulesForVueAndSvelteFiles = (
  config: expectedConfig
): expectedConfig[] => {
  const foundRules = Object.keys(config.rules).filter((rule) =>
    rulesDisabledForVueAndSvelteFiles.includes(rule)
  );

  if (foundRules.length === 0) {
    return [config];
  }

  const oldConfig = structuredClone(config);

  const newConfig: expectedConfig = {
    // flat configs use minimatch syntax
    files: ['!**/*.vue', '!**/*.svelte'],
    rules: {},
  };

  for (const rule of foundRules) {
    delete oldConfig.rules[rule];
    newConfig.rules[rule] = 'off';
  }

  return [oldConfig, newConfig];
};

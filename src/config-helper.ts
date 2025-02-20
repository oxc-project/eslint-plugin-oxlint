import { rulesDisabledForVueAndSvelteFiles } from './constants.js';

type expectedConfig = {
  rules: Record<string, 'off'>;
  plugins?: string[];
  overrides?: { files: string[]; rules: Record<string, 'off'> }[];
};

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

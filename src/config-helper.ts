import { rulesDisabledForVueAndSvelteFiles } from './constants.js';

export const overrideDisabledRulesForVueAndSvelteFiles = (config: {
  rules: Record<string, 'off'>;
  plugins?: string[];
  overrides?: { files: string[]; rules: Record<string, 'off'> }[];
}): void => {
  const foundRules = Object.keys(config.rules).filter((rule) =>
    rulesDisabledForVueAndSvelteFiles.includes(rule)
  );

  if (foundRules.length === 0) {
    return;
  }

  config.overrides = [
    {
      files: ['!*.vue', '!*.svelte'],
      rules: {},
    },
  ];

  for (const rule of foundRules) {
    delete config.rules[rule];
    config.overrides[0].rules[rule] = 'off';
  }
};

import { handleCategoriesScope } from './categories.js';
import { readPluginsFromConfig } from './plugins.js';
import { handleRulesScope, readRulesFromConfig } from './rules.js';
import {
  EslintPluginOxLintConfig,
  OxlintConfig,
  OxlintConfigCategories,
  OxlintConfigOverride,
} from './types.js';

export const handleOverridesScope = (
  overrides: OxlintConfigOverride[],
  configs: EslintPluginOxLintConfig[],
  baseCategories?: OxlintConfigCategories
): void => {
  for (const overrideIndex in overrides) {
    const override = overrides[overrideIndex];
    const eslintRules: Record<string, 'off'> = {};
    const eslintConfig: EslintPluginOxLintConfig = {
      name: `oxlint/from-oxlint-config-override-${overrideIndex}`,
    };

    // expect that oxlint `files` syntax is the same as eslint
    eslintConfig.files = override.files;

    const plugins = readPluginsFromConfig(override);
    if (baseCategories !== undefined && plugins !== undefined) {
      handleCategoriesScope(plugins, baseCategories, eslintRules);
    }

    const rules = readRulesFromConfig(override);
    if (rules !== undefined) {
      // ToDo -- when off, we should enable the default settings
      handleRulesScope(rules, eslintRules, false);
    }

    eslintConfig.rules = eslintRules;
    configs.push(eslintConfig);
  }
};

export const readOverridesFromConfig = (
  config: OxlintConfig
): OxlintConfigOverride[] | undefined => {
  return 'overrides' in config && Array.isArray(config.overrides)
    ? (config.overrides as OxlintConfigOverride[])
    : undefined;
};

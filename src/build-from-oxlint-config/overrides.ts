import { handleCategoriesScope } from './categories.js';
import { readPluginsFromConfig } from './plugins.js';
import { handleRulesScope, readRulesFromConfig } from './rules.js';
import {
  BuildFromOxlintConfigOptions,
  EslintPluginOxlintConfig,
  OxlintConfig,
  OxlintConfigCategories,
  OxlintConfigOverride,
} from './types.js';

export const handleOverridesScope = (
  overrides: OxlintConfigOverride[],
  configs: EslintPluginOxlintConfig[],
  baseCategories?: OxlintConfigCategories,
  options: BuildFromOxlintConfigOptions = {}
): void => {
  for (const [overrideIndex, override] of overrides.entries()) {
    const eslintRules: Record<string, 'off'> = {};
    const eslintConfig: EslintPluginOxlintConfig = {
      name: `oxlint/from-oxlint-config-override-${overrideIndex}`,
      // expect that oxlint `files` syntax is the same as eslint
      files: override.files,
    };

    const plugins = readPluginsFromConfig(override);
    if (baseCategories !== undefined && plugins !== undefined) {
      handleCategoriesScope(plugins, baseCategories, eslintRules, options);
    }

    const rules = readRulesFromConfig(override);
    if (rules !== undefined) {
      handleRulesScope(rules, eslintRules, options);
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

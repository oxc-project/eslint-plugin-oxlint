import {
  type BuildFromOxlintConfigOptions,
  type EslintPluginOxlintConfig,
  type OxlintConfig,
} from './types.js';
import { handleRulesScope, readRulesFromConfig } from './rules.js';
import {
  defaultCategories,
  handleCategoriesScope,
  readCategoriesFromConfig,
} from './categories.js';
import { defaultPlugins, readPluginsFromConfig } from './plugins.js';
import { handleIgnorePatternsScope, readIgnorePatternsFromConfig } from './ignore-patterns.js';
import { handleOverridesScope, readOverridesFromConfig } from './overrides.js';
import { splitDisabledRulesForVueAstroAndSvelteFiles } from '../config-helper.js';
import {
  handleExtendsScope,
  readExtendsConfigsFromConfig,
  resolveRelativeExtendsPaths,
} from './extends.js';
import { getConfigContent, getJsoncContent } from './loader.js';

/**
 * builds turned off rules, which are supported by oxlint.
 * It accepts an object similar to the .oxlintrc.json file.
 */
export const buildFromOxlintConfig = (
  config: OxlintConfig,
  options: BuildFromOxlintConfigOptions = {}
): EslintPluginOxlintConfig[] => {
  // if the option is not explicitly set but the config has typeAware enabled, we will enable it by default
  if (config.options?.typeAware === true && options.typeAware === undefined) {
    options.typeAware = true;
  }
  resolveRelativeExtendsPaths(config);

  const extendConfigs = readExtendsConfigsFromConfig(config);
  if (extendConfigs.length > 0) {
    handleExtendsScope(extendConfigs, config);
  }

  const rules: Record<string, 'off'> = {};
  const plugins = readPluginsFromConfig(config) ?? defaultPlugins;
  const categories = readCategoriesFromConfig(config) ?? defaultCategories;

  // it is not a plugin but it is activated by default
  plugins.push('eslint');

  // oxc handles "react-hooks" rules inside "react" plugin
  // our generator split them into own plugins
  if (plugins.includes('react')) {
    plugins.push('react-hooks');
  }

  handleCategoriesScope(plugins, categories, rules, options);

  const configRules = readRulesFromConfig(config);

  if (configRules !== undefined) {
    handleRulesScope(configRules, rules, options);
  }

  const baseConfig = {
    name: 'oxlint/from-oxlint-config',
    rules,
  };

  const overrides = readOverridesFromConfig(config);
  const configs = splitDisabledRulesForVueAstroAndSvelteFiles(
    baseConfig
  ) as EslintPluginOxlintConfig[];

  if (overrides !== undefined) {
    handleOverridesScope(overrides, configs, categories, options);
  }

  const ignorePatterns = readIgnorePatternsFromConfig(config);
  if (ignorePatterns === undefined) {
    return configs;
  } else {
    const ignoreConfig: EslintPluginOxlintConfig = {
      name: 'oxlint/oxlint-config-ignore-patterns',
    };
    handleIgnorePatternsScope(ignorePatterns, ignoreConfig);
    return [ignoreConfig, ...configs];
  }
};

/**
 * builds turned off rules, which are supported by oxlint.
 * It accepts a filepath to the .oxlintrc.json file.
 *
 * If the .oxlintrc.json file could not be found or parsed,
 * an error will be thrown.
 *
 * Does only work with JSON / JSONC files.
 * @deprecated Use `buildFromConfigFile` instead.
 */
export const buildFromOxlintConfigFile = (
  oxlintConfigFile: string,
  options: BuildFromOxlintConfigOptions = {}
): EslintPluginOxlintConfig[] => {
  const config = getJsoncContent(oxlintConfigFile);
  return buildFromOxlintConfig(config, options);
};

/**
 * builds turned off rules, which are supported by oxlint.
 * It accepts a filepath to the oxlint/vite config file.
 *
 * If the config file could not be found or parsed, an error will be thrown.
 *
 * Does work with Oxlint JS / TS / JSON / JSONC configuration files.
 * Does work with Vite-Plus configuration files (`vite.config.*`),
 * which do not used function-based configurations.
 */
export const buildFromConfigFile = async (
  oxlintConfigFile: string,
  options: BuildFromOxlintConfigOptions = {}
): Promise<EslintPluginOxlintConfig[]> => {
  const config = await getConfigContent(oxlintConfigFile);
  return buildFromOxlintConfig(config, options);
};

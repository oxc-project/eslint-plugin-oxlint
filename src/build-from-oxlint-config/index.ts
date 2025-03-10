import fs from 'node:fs';
import JSONCParser from 'jsonc-parser';
import {
  EslintPluginOxlintConfig,
  OxlintConfig,
  OxlintConfigCategories,
  OxlintConfigPlugins,
} from './types.js';
import { isObject } from './utilities.js';
import { handleRulesScope, readRulesFromConfig } from './rules.js';
import {
  handleCategoriesScope,
  readCategoriesFromConfig,
} from './categories.js';
import { readPluginsFromConfig } from './plugins.js';
import {
  handleIgnorePatternsScope,
  readIgnorePatternsFromConfig,
} from './ignore-patterns.js';
import { handleOverridesScope, readOverridesFromConfig } from './overrides.js';
import { splitDisabledRulesForVueAndSvelteFiles } from '../config-helper.js';

// default plugins, see <https://oxc.rs/docs/guide/usage/linter/config#plugins>
const defaultPlugins: OxlintConfigPlugins = ['react', 'unicorn', 'typescript'];

// default categories, see <https://github.com/oxc-project/oxc/blob/0acca58/crates/oxc_linter/src/builder.rs#L82>
const defaultCategories: OxlintConfigCategories = { correctness: 'warn' };

/**
 * tries to read the oxlint config file and returning its JSON content.
 * if the file is not found or could not be parsed, undefined is returned.
 * And an error message will be emitted to `console.error`
 */
const getConfigContent = (
  oxlintConfigFile: string
): OxlintConfig | undefined => {
  try {
    const content = fs.readFileSync(oxlintConfigFile, 'utf8');

    try {
      const configContent = JSONCParser.parse(content);

      if (!isObject(configContent)) {
        throw new TypeError('not an valid config file');
      }

      return configContent;
    } catch {
      console.error(
        `eslint-plugin-oxlint: could not parse oxlint config file: ${oxlintConfigFile}`
      );
      return undefined;
    }
  } catch {
    console.error(
      `eslint-plugin-oxlint: could not find oxlint config file: ${oxlintConfigFile}`
    );
    return undefined;
  }
};

/**
 * builds turned off rules, which are supported by oxlint.
 * It accepts an object similar to the .oxlintrc.json file.
 */
export const buildFromOxlintConfig = (
  config: OxlintConfig
): EslintPluginOxlintConfig[] => {
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

  handleCategoriesScope(plugins, categories, rules);

  const configRules = readRulesFromConfig(config);

  if (configRules !== undefined) {
    handleRulesScope(configRules, rules);
  }

  const baseConfig = {
    name: 'oxlint/from-oxlint-config',
    rules,
  };

  const ignorePatterns = readIgnorePatternsFromConfig(config);

  if (ignorePatterns !== undefined) {
    handleIgnorePatternsScope(ignorePatterns, baseConfig);
  }

  const overrides = readOverridesFromConfig(config);
  const configs = splitDisabledRulesForVueAndSvelteFiles(
    baseConfig
  ) as EslintPluginOxlintConfig[];

  if (overrides !== undefined) {
    handleOverridesScope(overrides, configs, categories);
  }

  return configs;
};

/**
 * builds turned off rules, which are supported by oxlint.
 * It accepts an filepath to the .oxlintrc.json file.
 *
 * It the .oxlintrc.json file could not be found or parsed,
 * no rules will be deactivated and an error to `console.error` will be emitted
 */
export const buildFromOxlintConfigFile = (
  oxlintConfigFile: string
): EslintPluginOxlintConfig[] => {
  const config = getConfigContent(oxlintConfigFile);

  // we could not parse form the file, do not build with default values
  // we can not be sure if the setup is right
  if (config === undefined) {
    return [];
  }

  return buildFromOxlintConfig(config);
};

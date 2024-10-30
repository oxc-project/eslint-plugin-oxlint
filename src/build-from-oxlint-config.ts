import fs from 'node:fs';
import configByCategory from './configs-by-category.js';
import type { Linter } from 'eslint';
import JSONCParser from 'jsonc-parser';

// these are the mappings from the scope in the rules.rs to the eslint scope
// only used for the scopes where the directory structure doesn't reflect the eslint scope
// such as `typescript` vs `@typescript-eslint` or others. Eslint as a scope is an exception,
// as eslint doesn't have a scope.
// There is a duplicate in scripts/constants.js, for clean builds we manage it in 2 files.
// In the future we can generate maybe this constant into src folder
const scopeMaps = {
  eslint: '',
  typescript: '@typescript-eslint',
};

type OxlintConfigPlugins = string[];

type OxlintConfigCategories = Record<string, unknown>;

type OxlintConfigRules = Record<string, unknown>;

type OxlintConfig = {
  [key: string]: unknown;
  plugins?: OxlintConfigPlugins;
  categories?: OxlintConfigCategories;
  rules?: OxlintConfigRules;
};

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

      if (typeof configContent !== 'object' || Array.isArray(configContent)) {
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
 * appends all rules which are enabled by a plugin and falls into a specific category
 */
const handleCategoriesScope = (
  plugins: OxlintConfigPlugins,
  categories: OxlintConfigCategories,
  rules: Record<string, 'off'>
): void => {
  for (const category in categories) {
    const configName = `flat/${category}`;

    // category is not enabled or not in found categories
    if (categories[category] === 'off' || !(configName in configByCategory)) {
      continue;
    }

    // @ts-ignore -- come on TS, we are checking if the configName exists in the configByCategory
    const possibleRules = configByCategory[configName].rules;

    // iterate to each rule to check if the rule can be appended, because the plugin is activated
    Object.keys(possibleRules).forEach((rule) => {
      plugins.forEach((plugin) => {
        // @ts-ignore -- come on TS, we are checking if the plugin exists in the configByscopeMapsCategory
        const pluginPrefix = plugin in scopeMaps ? scopeMaps[plugin] : plugin;

        // the rule has no prefix, so it is a eslint one
        if (pluginPrefix === '' && !rule.includes('/')) {
          rules[rule] = 'off';
          // other rules with a prefix like @typescript-eslint/
        } else if (rule.startsWith(`${pluginPrefix}/`)) {
          rules[rule] = 'off';
        }
      });
    });
  }
};

/**
 * checks if the oxlint rule is activated/deactivated and append/remove it.
 */
const handleRulesScope = (
  oxlintRules: OxlintConfigRules,
  rules: Record<string, 'off'>
): void => {
  for (const rule in oxlintRules) {
    // is this rules not turned off
    if (isActiveValue(oxlintRules[rule])) {
      rules[rule] = 'off';
    } else if (rule in rules && isDeactivateValue(oxlintRules[rule])) {
      // rules extended by categories or plugins can be disabled manually
      delete rules[rule];
    }
  }
};

/**
 * check if the value is "off", 0, ["off", ...], or [0, ...]
 */
const isDeactivateValue = (value: unknown): boolean => {
  const isOff = (value: unknown) => value === 'off' || value === 0;

  return isOff(value) || (Array.isArray(value) && isOff(value[0]));
};

/**
 * check if the value is "error", "warn", 1, 2, ["error", ...], ["warn", ...], [1, ...], or [2, ...]
 */
const isActiveValue = (value: unknown): boolean => {
  const isOn = (value: unknown) =>
    value === 'error' || value === 'warn' || value === 1 || value === 2;

  return isOn(value) || (Array.isArray(value) && isOn(value[0]));
};

/**
 * tries to return the "plugins" section from the config.
 * it returns `undefined` when not found or invalid.
 */
const readPluginsFromConfig = (
  config: OxlintConfig
): OxlintConfigPlugins | undefined => {
  return 'plugins' in config && Array.isArray(config.plugins)
    ? (config.plugins as OxlintConfigPlugins)
    : undefined;
};

/**
 * tries to return the "categories" section from the config.
 * it returns `undefined` when not found or invalid.
 */
const readCategoriesFromConfig = (
  config: OxlintConfig
): OxlintConfigCategories | undefined => {
  return 'categories' in config &&
    typeof config.categories === 'object' &&
    config.categories !== null
    ? (config.categories as OxlintConfigCategories)
    : undefined;
};

/**
 * tries to return the "rules" section from the config.
 * it returns `undefined` when not found or invalid.
 */
const readRulesFromConfig = (
  config: OxlintConfig
): OxlintConfigRules | undefined => {
  return 'rules' in config &&
    typeof config.rules === 'object' &&
    config.rules !== null
    ? (config.rules as OxlintConfigRules)
    : undefined;
};

/**
 * builds turned off rules, which are supported by oxlint.
 * It accepts an object similar to the oxlint.json file.
 */
export const buildFromOxlintConfig = (
  config: OxlintConfig
): Linter.Config<Record<string, 'off'>>[] => {
  const rules: Record<string, 'off'> = {};
  const plugins = readPluginsFromConfig(config) ?? defaultPlugins;

  // it is not a plugin but it is activated by default
  plugins.push('eslint');

  handleCategoriesScope(
    plugins,
    readCategoriesFromConfig(config) ?? defaultCategories,
    rules
  );

  const configRules = readRulesFromConfig(config);

  if (configRules !== undefined) {
    handleRulesScope(configRules, rules);
  }

  return [
    {
      name: 'oxlint/from-oxlint-config',
      rules,
    },
  ];
};

/**
 * builds turned off rules, which are supported by oxlint.
 * It accepts an filepath to the oxlint.json file.
 *
 * It the oxlint.json file could not be found or parsed,
 * no rules will be deactivated and an error to `console.error` will be emitted
 */
export const buildFromOxlintConfigFile = (
  oxlintConfigFile: string
): Linter.Config<Record<string, 'off'>>[] => {
  const config = getConfigContent(oxlintConfigFile);

  // we could not parse form the file, do not build with default values
  // we can not be sure if the setup is right
  if (config === undefined) {
    return [
      {
        name: 'oxlint/from-oxlint-config',
      },
    ];
  }

  return buildFromOxlintConfig(config);
};

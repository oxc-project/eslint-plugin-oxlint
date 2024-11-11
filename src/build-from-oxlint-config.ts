import fs from 'node:fs';
import configByCategory from './generated/configs-by-category.js';
import type { Linter } from 'eslint';
import JSONCParser from 'jsonc-parser';
import {
  aliasPluginNames,
  reactHookRulesInsideReactScope,
} from './constants.js';

const allRulesObjects = Object.values(configByCategory).map(
  (config) => config.rules
);
const allRules: string[] = allRulesObjects.flatMap((rulesObject) =>
  Object.keys(rulesObject)
);

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
 * Detects it the value is an object
 */
const isObject = (value: unknown): boolean =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

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

    // @ts-expect-error -- come on TS, we are checking if the configName exists in the configByCategory
    const possibleRules = configByCategory[configName].rules;

    // iterate to each rule to check if the rule can be appended, because the plugin is activated
    for (const rule of Object.keys(possibleRules)) {
      for (const plugin of plugins) {
        const pluginPrefix =
          plugin in aliasPluginNames ? aliasPluginNames[plugin] : plugin;

        // the rule has no prefix, so it is a eslint one
        if (pluginPrefix === '' && !rule.includes('/')) {
          rules[rule] = 'off';
          // other rules with a prefix like @typescript-eslint/
        } else if (rule.startsWith(`${pluginPrefix}/`)) {
          rules[rule] = 'off';
        }
      }
    }
  }
};

const getEsLintRuleName = (rule: string): string | undefined => {
  // there is no plugin prefix, it can be all plugin
  if (!rule.includes('/')) {
    return allRules.find(
      (search) => search.endsWith(`/${rule}`) || search === rule
    );
  }

  // greedy works with `@next/next/no-img-element` as an example
  const match = rule.match(/(^.*)\/(.*)/);

  if (match === null) {
    return undefined;
  }

  const pluginName = match[1];
  const ruleName = match[2];

  // map to the right eslint plugin
  let esPluginName =
    pluginName in aliasPluginNames ? aliasPluginNames[pluginName] : pluginName;

  // special case for eslint-plugin-react-hooks
  if (
    esPluginName === 'react' &&
    reactHookRulesInsideReactScope.includes(ruleName)
  ) {
    esPluginName = 'react-hooks';
  }

  // extra check for eslint
  const expectedRule =
    esPluginName === '' ? ruleName : `${esPluginName}/${ruleName}`;

  return allRules.find((rule) => rule == expectedRule);
};

/**
 * checks if the oxlint rule is activated/deactivated and append/remove it.
 */
const handleRulesScope = (
  oxlintRules: OxlintConfigRules,
  rules: Record<string, 'off'>
): void => {
  for (const rule in oxlintRules) {
    const eslintName = getEsLintRuleName(rule);

    if (eslintName === undefined) {
      console.warn(
        `eslint-plugin-oxlint: could not find matching eslint rule for "${rule}"`
      );
      continue;
    }

    // is this rules not turned off
    if (isActiveValue(oxlintRules[rule])) {
      rules[eslintName] = 'off';
    } else if (rule in rules && isDeactivateValue(oxlintRules[rule])) {
      // rules extended by categories or plugins can be disabled manually
      delete rules[eslintName];
    }
  }
};

/**
 * checks if value is validSet, or if validSet is an array, check if value is first value of it
 */
const isValueInSet = (value: unknown, validSet: unknown[]) =>
  validSet.includes(value) ||
  (Array.isArray(value) && validSet.includes(value[0]));

/**
 * check if the value is "off", 0, ["off", ...], or [0, ...]
 */
const isDeactivateValue = (value: unknown) => isValueInSet(value, ['off', 0]);

/**
 * check if the value is "error", "warn", 1, 2, ["error", ...], ["warn", ...], [1, ...], or [2, ...]
 */
const isActiveValue = (value: unknown) =>
  isValueInSet(value, ['error', 'warn', 1, 2]);

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
  return 'categories' in config && isObject(config.categories)
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
  return 'rules' in config && isObject(config.rules)
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

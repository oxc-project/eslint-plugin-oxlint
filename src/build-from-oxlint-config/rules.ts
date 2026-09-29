import {
  additionalEslintPluginPrefixes,
  aliasPluginNames,
  reactHookRulesInsideReactScope,
  typescriptRulesExtendEslintRules,
} from '../constants.js';
import { BuildFromOxlintConfigOptions, OxlintConfigRules } from './types.js';
import * as allRulesObjects from '../generated/rules-by-category.js';
import { isObject } from './utilities.js';

const allRules: string[] = Object.values(allRulesObjects).flatMap((rulesObject) =>
  Object.keys(rulesObject)
);

const typeAwareRules = new Set(
  Object.entries(allRulesObjects)
    .filter(([key]) => key.endsWith('TypeAwareRules'))
    .flatMap(([, rulesObject]) => Object.keys(rulesObject))
);

const getEsLintRuleName = (
  rule: string,
  options: BuildFromOxlintConfigOptions = {}
): string | undefined => {
  // there is no plugin prefix, it can be all plugin
  if (!rule.includes('/')) {
    const found = allRules.find((search) => search.endsWith(`/${rule}`) || search === rule);

    if (!found) {
      return undefined;
    }

    // Filter out nursery rules unless explicitly enabled
    if (!options.withNursery && found in allRulesObjects.nurseryRules) {
      return undefined;
    }

    // Check for type-aware rules when enabled
    if (!options.typeAware && typeAwareRules.has(found)) {
      return undefined;
    }

    return found;
  }

  // greedy works with `@next/next/no-img-element` as an example
  const match = rule.match(/(^.*)\/(.*)/);

  if (match === null) {
    return undefined;
  }

  const pluginName = match[1];
  const ruleName = match[2];

  // map to the right eslint plugin
  let esPluginName = pluginName in aliasPluginNames ? aliasPluginNames[pluginName] : pluginName;

  // special case for eslint-plugin-react-hooks
  if (esPluginName === 'react' && reactHookRulesInsideReactScope.includes(ruleName)) {
    esPluginName = 'react-hooks';
  }

  // special case for eslint-plugin-react-refresh
  if (esPluginName === 'react' && ruleName == 'only-export-components') {
    esPluginName = 'react-refresh';
  }

  // extra check for eslint
  const expectedRule = esPluginName === '' ? ruleName : `${esPluginName}/${ruleName}`;

  const found = allRules.find((rule) => rule === expectedRule);

  if (!found) {
    return undefined;
  }
  // Filter out nursery rules unless explicitly enabled
  if (!options.withNursery && found in allRulesObjects.nurseryRules) {
    return undefined;
  }

  // Check for type-aware rules when enabled
  if (!options.typeAware && typeAwareRules.has(found)) {
    return undefined;
  }

  return found;
};

/**
 * checks if value is validSet, or if validSet is an array, check if value is first value of it
 */
const isValueInSet = (value: unknown, validSet: unknown[]) =>
  validSet.includes(value) || (Array.isArray(value) && validSet.includes(value[0]));

/**
 * check if the value is "off", 0, ["off", ...], or [0, ...]
 */
const isDeactivateValue = (value: unknown) => isValueInSet(value, ['off', 0]);

/**
 * check if the value is "error", "warn", 1, 2, ["error", ...], ["warn", ...], [1, ...], or [2, ...]
 */
const isActiveValue = (value: unknown) => isValueInSet(value, ['error', 'warn', 1, 2]);

/**
 * one oxlint rule can map onto several ESLint rules:
 * `eslint-plugin-import-x` is a fork of `eslint-plugin-import` publishing the same rules under
 * its own prefix, and some ESLint core rules are re-implemented by `@typescript-eslint`.
 * Toggling the oxlint rule has to toggle all of them.
 */
const getAliasRuleNames = (eslintName: string): string[] => {
  const separatorIndex = eslintName.lastIndexOf('/');
  const pluginName = separatorIndex === -1 ? '' : eslintName.slice(0, separatorIndex);
  const ruleName = eslintName.slice(separatorIndex + 1);

  const aliases = (additionalEslintPluginPrefixes[pluginName] ?? []).map(
    (prefix) => `${prefix}/${ruleName}`
  );

  if (typescriptRulesExtendEslintRules.includes(ruleName)) {
    // an ESLint core rule which typescript-eslint re-implements, and the other way around
    if (pluginName === '') {
      aliases.push(`@typescript-eslint/${ruleName}`);
    } else if (pluginName === '@typescript-eslint') {
      aliases.push(ruleName);
    }
  }

  return aliases.filter((alias) => allRules.includes(alias));
};

/**
 * checks if the oxlint rule is activated/deactivated and append/remove it.
 */
export const handleRulesScope = (
  oxlintRules: OxlintConfigRules,
  rules: Record<string, 'off'>,
  options: BuildFromOxlintConfigOptions = {}
): void => {
  for (const rule in oxlintRules) {
    const eslintName = getEsLintRuleName(rule, options);

    if (eslintName === undefined) {
      continue;
    }

    const eslintNames = [eslintName, ...getAliasRuleNames(eslintName)];

    // is this rules not turned off
    if (isActiveValue(oxlintRules[rule])) {
      for (const name of eslintNames) {
        rules[name] = 'off';
      }
    } else if (isDeactivateValue(oxlintRules[rule])) {
      // rules extended by categories or plugins can be disabled manually
      for (const name of eslintNames) {
        delete rules[name];
      }
    }
  }
};

/**
 * tries to return the "rules" section from the config.
 * it returns `undefined` when not found or invalid.
 */
export const readRulesFromConfig = (config: unknown): OxlintConfigRules | undefined => {
  return isObject(config) && 'rules' in config && isObject(config.rules) ? config.rules : undefined;
};

import {
  aliasPluginNames,
  reactHookRulesInsideReactScope,
  typescriptRulesExtendEslintRules,
} from '../constants.js';
import {
  BuildFromOxlintConfigOptions,
  OxlintConfig,
  OxlintConfigOverride,
  OxlintConfigRules,
} from './types.js';
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

    // is this rules not turned off
    if (isActiveValue(oxlintRules[rule])) {
      rules[eslintName] = 'off';

      // If this is an ESLint rule that has a TypeScript alias, disable that too
      if (!eslintName.includes('/') && typescriptRulesExtendEslintRules.includes(eslintName)) {
        const tsAlias = `@typescript-eslint/${eslintName}`;
        // Only add the alias if it exists in allRules
        if (allRules.includes(tsAlias)) {
          rules[tsAlias] = 'off';
        }
      }

      // If this is a TypeScript rule that has an ESLint base, disable that too
      if (eslintName.startsWith('@typescript-eslint/')) {
        const baseRule = eslintName.replace('@typescript-eslint/', '');
        if (typescriptRulesExtendEslintRules.includes(baseRule) && allRules.includes(baseRule)) {
          rules[baseRule] = 'off';
        }
      }
    } else if (rule in rules && isDeactivateValue(oxlintRules[rule])) {
      // rules extended by categories or plugins can be disabled manually
      delete rules[eslintName];

      // Also delete the TypeScript alias if it exists
      if (!eslintName.includes('/') && typescriptRulesExtendEslintRules.includes(eslintName)) {
        const tsAlias = `@typescript-eslint/${eslintName}`;
        if (tsAlias in rules) {
          delete rules[tsAlias];
        }
      }

      // Also delete the base ESLint rule if this is a TypeScript rule
      if (eslintName.startsWith('@typescript-eslint/')) {
        const baseRule = eslintName.replace('@typescript-eslint/', '');
        if (baseRule in rules) {
          delete rules[baseRule];
        }
      }
    }
  }
};

/**
 * tries to return the "rules" section from the config.
 * it returns `undefined` when not found or invalid.
 */
export const readRulesFromConfig = (
  config: OxlintConfig | OxlintConfigOverride
): OxlintConfigRules | undefined => {
  return 'rules' in config && isObject(config.rules)
    ? (config.rules as OxlintConfigRules)
    : undefined;
};

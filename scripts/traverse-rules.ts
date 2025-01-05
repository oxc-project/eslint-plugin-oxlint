import { execSync } from 'node:child_process';
import { ignoreCategories, ignoreScope } from './constants.js';
import {
  aliasPluginNames,
  reactHookRulesInsideReactScope,
  typescriptRulesExtendEslintRules,
  unicornRulesExtendEslintRules,
  viteTestCompatibleRules,
} from '../src/constants.js';

export type Rule = {
  value: string;
  scope: string;
  category: string;
};

/**
 * Read the rules from oxlint command and returns an array of Rule-Objects
 */
function readRulesFromCommand(): Rule[] {
  // do not handle the exception
  const oxlintOutput = execSync(`npx oxlint --rules --format=json`, {
    encoding: 'utf8',
    stdio: 'pipe',
  });

  // do not handle the exception
  return JSON.parse(oxlintOutput);
}

/**
 * Some rules are in a different scope then in eslint
 */
function fixScopeOfRule(rule: Rule): void {
  if (
    rule.scope === 'react' &&
    reactHookRulesInsideReactScope.includes(rule.value)
  ) {
    rule.scope = 'react_hooks';
  }
}

/**
 * oxlint returns the value without a scope name
 */
function fixValueOfRule(rule: Rule): void {
  if (rule.scope === 'eslint') {
    return;
  }

  const scope =
    rule.scope in aliasPluginNames ? aliasPluginNames[rule.scope] : rule.scope;

  rule.value = `${scope}/${rule.value}`;
}

/**
 * some rules are reimplemented in another scope
 * remap them so we can disable all the reimplemented too
 */
function getAliasRules(rule: Rule): Rule | undefined {
  if (
    rule.scope === 'eslint' &&
    typescriptRulesExtendEslintRules.includes(rule.value)
  ) {
    return {
      value: `@typescript-eslint/${rule.value}`,
      scope: 'typescript',
      category: rule.category,
    };
  }

  if (rule.scope === 'jest' && viteTestCompatibleRules.includes(rule.value)) {
    return {
      value: `vitest/${rule.value}`,
      scope: 'vitest',
      category: rule.category,
    };
  }

  if (
    rule.scope === 'eslint' &&
    unicornRulesExtendEslintRules.includes(rule.value)
  ) {
    return {
      value: `unicorn/${rule.value}`,
      scope: 'unicorn',
      category: rule.category,
    };
  }
}

export function traverseRules(): Rule[] {
  // get all rules and filter the ignored one
  const rules = readRulesFromCommand().filter(
    (rule) =>
      !ignoreCategories.has(rule.category) && !ignoreScope.has(rule.scope)
  );

  const aliasRules: Rule[] = [];

  for (const rule of rules) {
    const aliasRule = getAliasRules(rule);
    if (aliasRule) {
      aliasRules.push(aliasRule);
    }

    fixScopeOfRule(rule);
    fixValueOfRule(rule);
  }

  return [...rules, ...aliasRules];
}

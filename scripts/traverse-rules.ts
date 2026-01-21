import { execSync } from 'node:child_process';
import { ignoreScope } from './constants.js';
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
  if (rule.scope === 'react' && reactHookRulesInsideReactScope.includes(rule.value)) {
    rule.scope = 'react_hooks';
  }

  if (rule.scope === 'n') {
    rule.scope = 'node';
  }
}

/**
 * oxlint returns the value without a scope name
 */
function fixValueOfRule(rule: Rule): void {
  if (rule.scope === 'eslint') {
    return;
  }

  const scope = rule.scope in aliasPluginNames ? aliasPluginNames[rule.scope] : rule.scope;

  rule.value = `${scope}/${rule.value}`;
}

/**
 * some rules are reimplemented in another scope or available in multiple ESLint plugins,
 * remap them so we can disable all of those too
 */
function getAliasRules(rule: Rule): Rule | undefined {
  if (rule.scope === 'eslint' && typescriptRulesExtendEslintRules.includes(rule.value)) {
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

  if (rule.scope === 'import') {
    return {
      value: `import-x/${rule.value}`,
      scope: 'import',
      category: rule.category,
    };
  }

  // Oxlint supports eslint-plugin-n rules only under the `node` plugin name.
  if (rule.scope === 'node') {
    return {
      value: `n/${rule.value}`,
      scope: 'node',
      category: rule.category,
    };
  }

  // This rule comes from eslint-plugin-react-refresh but is namespaced under `react/`
  // in oxlint.
  if (rule.scope === 'react' && rule.value === 'only-export-components') {
    return {
      value: `react-refresh/${rule.value}`,
      scope: 'react',
      category: rule.category,
    };
  }

  if (rule.scope === 'eslint' && unicornRulesExtendEslintRules.includes(rule.value)) {
    return {
      value: `unicorn/${rule.value}`,
      scope: 'unicorn',
      category: rule.category,
    };
  }
}

export function traverseRules(): Rule[] {
  // get all rules and filter the ignored one
  const rules = readRulesFromCommand().filter((rule) => !ignoreScope.has(rule.scope));

  const aliasRules: Rule[] = [];

  for (const rule of rules) {
    const aliasRule = getAliasRules(rule);
    if (aliasRule) {
      aliasRules.push(aliasRule);
    }

    fixScopeOfRule(rule);
    fixValueOfRule(rule);
  }

  // Ensure all rules are unique
  return [...new Set([...rules, ...aliasRules])];
}

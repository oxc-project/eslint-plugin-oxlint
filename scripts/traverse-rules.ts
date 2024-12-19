import { execSync } from 'node:child_process';
import { ignoreCategories, ignoreScope } from './constants.js';
import {
  aliasPluginNames,
  reactHookRulesInsideReactScope,
} from '../src/constants.js';

export interface Rule {
  value: string;
  scope: string;
  category: string;
}

function readFilesFromCommand(): Rule[] {
  // do not handle the exception
  const oxlintOutput = execSync(`npx oxlint --rules --format=json`, {
    encoding: 'utf8',
    stdio: 'pipe',
  });

  // do not handle the exception
  return JSON.parse(oxlintOutput);
}

function fixScopeOfRule(rule: Rule): void {
  if (
    rule.scope === 'react' &&
    reactHookRulesInsideReactScope.includes(rule.value)
  ) {
    rule.scope = 'react_hooks';
  }
}

function fixValueOfRule(rule: Rule): void {
  if (rule.scope !== 'eslint') {
    const scope =
      rule.scope in aliasPluginNames
        ? aliasPluginNames[rule.scope]
        : rule.scope;

    rule.value = `${scope}/${rule.value}`;
  }
}

export function traverseRules(): Rule[] {
  // get all rules and filter the ignored one
  const rules = readFilesFromCommand().filter(
    (rule) =>
      !ignoreCategories.has(rule.category) && !ignoreScope.has(rule.scope)
  );

  // fix value mapping
  for (const rule of rules) {
    fixScopeOfRule(rule);
    fixValueOfRule(rule);
  }

  return rules;
}

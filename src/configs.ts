import * as ruleMapsByScope from './generated/rules-by-scope.js';
import * as ruleMapsByCategory from './generated/rules-by-category.js';
import configByScope from './generated/configs-by-scope.js';
import configByCategory from './generated/configs-by-category.js';
import {
  overrideDisabledRulesForVueAndSvelteFiles,
  splitDisabledRulesForVueAndSvelteFiles,
  splitDisabledRulesForVueAndSvelteFilesDeep,
} from './config-helper.js';

type UnionToIntersection<U> = (
  U extends unknown ? (x: U) => void : never
) extends (x: infer I) => void
  ? I
  : never;

type RulesGroups = keyof typeof ruleMapsByScope;
type AllRules = (typeof ruleMapsByScope)[RulesGroups];

const allRules: UnionToIntersection<AllRules> = Object.assign(
  {},
  ...Object.values(ruleMapsByScope)
);

export default {
  recommended: overrideDisabledRulesForVueAndSvelteFiles({
    plugins: ['oxlint'],
    rules: ruleMapsByCategory.correctnessRules,
  }),
  all: overrideDisabledRulesForVueAndSvelteFiles({
    plugins: ['oxlint'],
    rules: allRules,
  }),
  'flat/all': splitDisabledRulesForVueAndSvelteFiles({
    name: 'oxlint/all',
    rules: allRules,
  }),
  'flat/recommended': splitDisabledRulesForVueAndSvelteFiles({
    name: 'oxlint/recommended',
    rules: ruleMapsByCategory.correctnessRules,
  }),
  ...splitDisabledRulesForVueAndSvelteFilesDeep(configByScope),
  ...splitDisabledRulesForVueAndSvelteFilesDeep(configByCategory),
} as const;

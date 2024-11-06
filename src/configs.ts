import * as ruleMapsByScope from './generated/rules-by-scope.js';
import * as ruleMapsByCategory from './generated/rules-by-category.js';
import configByScope from './generated/configs-by-scope.js';
import configByCategory from './generated/configs-by-category.js';

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
  recommended: {
    plugins: ['oxlint'],
    rules: ruleMapsByCategory.correctnessRules,
  },
  all: {
    plugins: ['oxlint'],
    rules: allRules,
  },
  'flat/all': {
    name: 'oxlint/all',
    rules: allRules,
  },
  'flat/recommended': {
    name: 'oxlint/recommended',
    rules: ruleMapsByCategory.correctnessRules,
  },
  ...configByScope,
  ...configByCategory,
};

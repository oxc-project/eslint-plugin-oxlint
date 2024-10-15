import * as ruleMapsByScope from './rules-by-scope.js';
import * as ruleMapsByCategory from './rules-by-category.js';
import configByScope from './configs-by-scope.js';
import configByCategory from './configs-by-category.js';

type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (
  x: infer I
) => void
  ? I
  : never;

type RulesGroups = keyof typeof ruleMapsByScope;
type AllRules = (typeof ruleMapsByScope)[RulesGroups];

const allRules: UnionToIntersection<AllRules> = Object.assign(
  {},
  ...Object.values(ruleMapsByScope)
);

export default {
  configs: {
    recommended: {
      name: 'oxlint ignore rules recommended',
      plugins: ['oxlint'],
      rules: ruleMapsByCategory.correctnessRules,
    },
    all: {
      name: 'oxlint ignore rules all',
      plugins: ['oxlint'],
      rules: allRules,
    },
    'flat/all': {
      name: 'oxlint ignore rules all',
      rules: allRules,
    },
    'flat/recommended': {
      name: 'oxlint ignore rules recommended',
      rules: ruleMapsByCategory.correctnessRules,
    },
    ...configByScope,
    ...configByCategory,
  },
};

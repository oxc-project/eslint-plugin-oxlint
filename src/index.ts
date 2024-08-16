import * as ruleMapsByScope from './rules-by-scope.js';
import * as ruleMapsByCategory from './rules-by-category.js';
import { createFlatRulesConfig } from './utils.js';

const allRules: Record<string, string> = Object.assign(
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
    ...createFlatRulesConfig(ruleMapsByScope),
    ...createFlatRulesConfig(ruleMapsByCategory),
  },
};

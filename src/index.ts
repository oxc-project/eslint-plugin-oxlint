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
      plugins: ['oxlint'],
      rules: ruleMapsByCategory.correctnessRules,
    },
    all: {
      plugins: ['oxlint'],
      rules: allRules,
    },
    'flat/all': {
      rules: allRules,
    },
    'flat/recommended': {
      rules: ruleMapsByCategory.correctnessRules,
    },
    ...createFlatRulesConfig(ruleMapsByScope),
    ...createFlatRulesConfig(ruleMapsByCategory),
  },
};

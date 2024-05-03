import * as rulesByScope from './rules-by-scope.mjs';
import * as rulesByCategory from './rules-by-category.mjs';
import { correctnessRules } from './rules-by-category.mjs';
import { createFlatRulesConfig } from './utils.mjs';
const allRules = Object.assign({}, ...Object.values(rulesByScope));
const index = {
  configs: {
    recommended: {
      plugins: ['oxlint'],
      rules: correctnessRules,
    },
    all: {
      plugins: ['oxlint'],
      rules: allRules,
    },
    'flat/all': {
      rules: allRules,
    },
    'flat/recommended': {
      rules: correctnessRules,
    },
    ...createFlatRulesConfig(rulesByScope),
    ...createFlatRulesConfig(rulesByCategory),
  },
};
export { index as default };

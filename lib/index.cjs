'use strict';
const rulesByScope = require('./rules-by-scope.cjs');
const rulesByCategory = require('./rules-by-category.cjs');
const utils = require('./utils.cjs');
const allRules = Object.assign({}, ...Object.values(rulesByScope));
const index = {
  configs: {
    recommended: {
      plugins: ['oxlint'],
      rules: rulesByCategory.correctnessRules,
    },
    all: {
      plugins: ['oxlint'],
      rules: allRules,
    },
    'flat/all': {
      rules: allRules,
    },
    'flat/recommended': {
      rules: rulesByCategory.correctnessRules,
    },
    ...utils.createFlatRulesConfig(rulesByScope),
    ...utils.createFlatRulesConfig(rulesByCategory),
  },
};
module.exports = index;

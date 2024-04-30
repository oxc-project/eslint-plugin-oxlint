/* eslint-disable @typescript-eslint/no-var-requires,no-undef */
const ruleMapsByScope = require("./rules-by-scope.cjs");
const ruleMapsByCategory = require("./rules-by-category.cjs");
const { createFlatRulesConfig } = require("./utils.cjs");

const config = {
  configs: {
    recommended: {
      plugins: ["oxlint"],
      rules: ruleMapsByCategory.correctnessRules,
    },
    "flat/recommended": {
      rules: ruleMapsByCategory.correctnessRules,
    },
    ...createFlatRulesConfig(ruleMapsByScope),
    ...createFlatRulesConfig(ruleMapsByCategory),
  },
};

module.exports = config;

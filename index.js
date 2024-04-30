import * as ruleMapsByScope from "./rules-by-scope.js";
import * as ruleMapsByCategory from "./rules-by-scope.js";
import { createFlatRulesConfig } from "./utils.js";

export default {
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

/* eslint-disable @typescript-eslint/no-var-requires,no-undef */
function createFlatRulesConfig(rulesModule) {
  const flatRulesConfig = {};

  // Iterate over each property in the rules module
  for (const key of Object.keys(rulesModule)) {
    if (key.endsWith("Rules")) {
      // Ensure the property is a rules set
      const flatKey = `flat/${key.replace("Rules", "")}`; // Create the new key
      flatRulesConfig[flatKey] = { rules: rulesModule[key] }; // Assign the rules to the new key
    }
  }

  return flatRulesConfig;
}

module.exports = {
  createFlatRulesConfig,
};

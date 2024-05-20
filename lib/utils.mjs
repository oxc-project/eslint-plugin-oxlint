function createFlatRulesConfig(rulesModule) {
  const flatRulesConfig = {};
  for (const key of Object.keys(rulesModule)) {
    if (key.endsWith('Rules')) {
      const flatKey = `flat/${key.replace('Rules', '')}`;
      flatRulesConfig[flatKey] = { rules: rulesModule[key] };
    }
  }
  return flatRulesConfig;
}
export { createFlatRulesConfig };

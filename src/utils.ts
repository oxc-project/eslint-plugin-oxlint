import { kebabCase } from 'scule';
export function createFlatRulesConfig(rulesModule: { [key: string]: unknown }) {
  const flatRulesConfig: { [key: string]: unknown } = {}; // Add index signature to allow indexing with a string

  // Iterate over each property in the rules module
  for (const key of Object.keys(rulesModule)) {
    if (key.endsWith('Rules')) {
      // Ensure the property is a rules set
      const flatKey = `flat/${kebabCase(key.replace('Rules', ''))}`; // Create the new key
      flatRulesConfig[flatKey] = { rules: rulesModule[key] }; // Assign the rules to the new key
    }
  }

  return flatRulesConfig;
}

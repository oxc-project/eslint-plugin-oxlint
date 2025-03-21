// these are the rules that don't have a direct equivalent in the eslint rules
export const ignoreScope: Set<string> = new Set([
  'oxc',
  'deepscan',
  'security',
]);

// these are the rules that are not fully implemented in oxc
export const ignoreCategories: Set<string> = new Set(['nursery']);

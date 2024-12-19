// these are the rules that don't have a direct equivalent in the eslint rules
export const ignoreScope = new Set(['oxc', 'deepscan', 'security']);

// these are the rules that are not fully implemented in oxc
export const ignoreCategories = new Set(['nursery']);

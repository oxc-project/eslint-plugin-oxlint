// these are the rules that don't have a direct equivalent in the eslint rules
export const ignoreScope = new Set(['oxc', 'deepscan', 'security']);

// TypeScript type-aware rules that require type information
// These are excluded from pre-built configs by default but can be enabled
// via the `typeAware` option in buildFromOxlintConfig
// List copied from:
// https://github.com/typescript-eslint/typescript-eslint/blob/7319bad3a5022be2adfbcb331451cfd85d1d786a/packages/eslint-plugin/src/configs/flat/disable-type-checked.ts
export const typescriptTypeAwareRules = [
  'await-thenable',
  'consistent-return',
  'consistent-type-exports',
  'dot-notation',
  'naming-convention',
  'no-array-delete',
  'no-base-to-string',
  'no-confusing-void-expression',
  'no-deprecated',
  'no-duplicate-type-constituents',
  'no-floating-promises',
  'no-for-in-array',
  'no-implied-eval',
  'no-meaningless-void-operator',
  'no-misused-promises',
  'no-misused-spread',
  'no-mixed-enums',
  'no-redundant-type-constituents',
  'no-unnecessary-boolean-literal-compare',
  'no-unnecessary-condition',
  'no-unnecessary-qualifier',
  'no-unnecessary-template-expression',
  'no-unnecessary-type-arguments',
  'no-unnecessary-type-assertion',
  'no-unnecessary-type-conversion',
  'no-unnecessary-type-parameters',
  'no-unsafe-argument',
  'no-unsafe-assignment',
  'no-unsafe-call',
  'no-unsafe-enum-comparison',
  'no-unsafe-member-access',
  'no-unsafe-return',
  'no-unsafe-type-assertion',
  'no-unsafe-unary-minus',
  'non-nullable-type-assertion-style',
  'only-throw-error',
  'prefer-destructuring',
  'prefer-find',
  'prefer-includes',
  'prefer-nullish-coalescing',
  'prefer-optional-chain',
  'prefer-promise-reject-errors',
  'prefer-readonly',
  'prefer-readonly-parameter-types',
  'prefer-reduce-type-parameter',
  'prefer-regexp-exec',
  'prefer-return-this-type',
  'prefer-string-starts-ends-with',
  'promise-function-async',
  'related-getter-setter-pairs',
  'require-array-sort-compare',
  'require-await',
  'restrict-plus-operands',
  'restrict-template-expressions',
  'return-await',
  'strict-boolean-expressions',
  'switch-exhaustiveness-check',
  'unbound-method',
  'use-unknown-in-catch-callback-variable',
];

// Set of type-aware rules with full names for efficient O(1) lookup
export const typeAwareRulesSet = new Set(
  typescriptTypeAwareRules.map((rule) => `@typescript-eslint/${rule}`)
);

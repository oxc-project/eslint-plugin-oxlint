// these are the mappings from the scope in the rules.rs to the eslint scope
// only used for the scopes where the directory structure doesn't reflect the eslint scope
// such as `typescript` vs `@typescript-eslint` or others. Eslint as a scope is an exception,
// as eslint doesn't have a scope.
// look here: <https://github.com/oxc-project/oxc/blob/0b329516372a0353e9eb18e5bc0fbe63bce21fee/crates/oxc_linter/src/config/rules.rs#L285>
export const aliasPluginNames: Record<string, string> = {
  // for scripts/generate and src/build-from-oxlint-config
  eslint: '',
  typescript: '@typescript-eslint',
  nextjs: '@next/next',

  // only for src/build-from-oxlint-config
  react_perf: 'react-perf',
  jsx_a11y: 'jsx-a11y',
  'import-x': 'import',
};

// Some typescript-eslint rules are re-implemented version of eslint rules.
// Since oxlint supports these rules under eslint/* and it also supports TS,
// we should override these to make implementation status up-to-date.
// remapping in source-code: <https://github.com/oxc-project/oxc/blob/814eab656291a7d809de808bf4a717bcfa483430/crates/oxc_linter/src/utils/mod.rs>
export const typescriptRulesExtendEslintRules = [
  'class-methods-use-this',
  'default-param-last',
  'init-declarations',
  'max-params',
  'no-array-constructor',
  'no-dupe-class-members',
  'no-empty-function',
  'no-invalid-this',
  'no-loop-func',
  'no-loss-of-precision',
  'no-magic-numbers',
  'no-redeclare',
  'no-restricted-imports',
  'no-shadow',
  'no-unused-expressions',
  'no-unused-vars',
  'no-use-before-define',
  'no-useless-constructor',
];

// Some vitest rules are re-implemented version of jest rules.
// Since oxlint supports these rules under jest/*, we need to remap them.
// remapping in source-code: <https://github.com/oxc-project/oxc/blob/814eab656291a7d809de808bf4a717bcfa483430/crates/oxc_linter/src/utils/mod.rs>
export const viteTestCompatibleRules = [
  'consistent-test-it',
  'expect-expect',
  'max-expects',
  'max-nested-describe',
  'no-alias-methods',
  'no-commented-out-tests',
  'no-conditional-expect',
  'no-conditional-in-test',
  'no-disabled-tests',
  'no-duplicate-hooks',
  'no-focused-tests',
  'no-hooks',
  'no-identical-title',
  'no-interpolation-in-snapshots',
  'no-restricted-jest-methods',
  'no-restricted-matchers',
  'no-standalone-expect',
  'no-test-prefixes',
  'no-test-return-statement',
  'prefer-comparison-matcher',
  'prefer-each',
  'prefer-equality-matcher',
  'prefer-expect-resolves',
  'prefer-hooks-in-order',
  'prefer-hooks-on-top',
  'prefer-lowercase-title',
  'prefer-mock-promise-shorthand',
  'prefer-strict-equal',
  'prefer-to-have-length',
  'prefer-todo',
  'require-to-throw-message',
  'require-top-level-describe',
  'valid-describe-callback',
  'valid-expect',
];

export const unicornRulesExtendEslintRules = ['no-negated-condition'];

// All rules from `eslint-plugin-react-hooks`
// Since oxlint supports these rules under react/*, we need to remap them.
export const reactHookRulesInsideReactScope = ['rules-of-hooks', 'exhaustive-deps'];

// These rules are disabled for vue and svelte files
// because oxlint can not parse currently the HTML
export const rulesDisabledForVueAndSvelteFiles = [
  'no-unused-vars',
  '@typescript-eslint/no-unused-vars',
  'react-hooks/rules-of-hooks', // disabled because its react
];

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

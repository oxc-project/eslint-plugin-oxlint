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
};

// Some typescript-eslint rules are re-implemented version of eslint rules.
// Since oxlint supports these rules under eslint/* and it also supports TS,
// we should override these to make implementation status up-to-date.
export const typescriptRulesExtendEslintRules = [
  'block-spacing',
  'brace-style',
  'class-methods-use-this',
  'comma-dangle',
  'comma-spacing',
  'default-param-last',
  'func-call-spacing',
  'indent',
  'init-declarations',
  'key-spacing',
  'keyword-spacing',
  'lines-around-comment',
  'lines-between-class-members',
  'max-params',
  'no-array-constructor',
  'no-dupe-class-members',
  'no-empty-function',
  'no-extra-parens',
  'no-extra-semi',
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
  'object-curly-spacing',
  'padding-line-between-statements',
  'quotes',
  'semi',
  'space-before-blocks',
  'space-before-function-paren',
  'space-infix-ops',
];

// Some vitest rules are re-implemented version of jest rules.
// Since oxlint supports these rules under jest/*, we need to remap them.
export const viteTestCompatibleRules = [
  'consistent-test-it',
  'expect-expect',
  'no-alias-methods',
  'no-conditional-expect',
  'no-conditional-in-test',
  'no-commented-out-tests',
  'no-disabled-tests',
  'no-focused-tests',
  'no-identical-title',
  'no-restricted-jest-methods',
  'no-test-prefixes',
  'prefer-hooks-in-order',
  'valid-describe-callback',
  'valid-expect',
];

// All rules from `eslint-plugin-react-hooks`
// Since oxlint supports these rules under react/*, we need to remap them.
export const reactHookRulesInsideReactScope = [
  'rules-of-hooks',
  'exhaustive-deps',
];

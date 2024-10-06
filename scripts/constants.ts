import path from 'node:path';

const __dirname = new URL('.', import.meta.url).pathname;

export const TARGET_DIRECTORY = path.resolve(__dirname, '..', '.oxc_sparse');
export const VERSION_PREFIX = 'oxlint_v';
export const SPARSE_CLONE_DIRECTORY = 'crates/oxc_linter/src';

// these are the rules that don't have a direct equivalent in the eslint rules
export const ignoreScope = new Set(['oxc', 'deepscan']);

// these are the mappings from the scope in the rules.rs to the eslint scope
// only used for the scopes where the directory structure doesn't reflect the eslint scope
// such as `typescript` vs `@typescript-eslint` or others. Eslint as a scope is an exception,
// as eslint doesn't have a scope.
export const scopeMaps = {
  eslint: '',
  typescript: '@typescript-eslint',
};

// Some typescript-eslint rules are re-implemented version of eslint rules.
// e.g. no-array-constructor, max-params, etc...
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

export function convertScope(scope: string) {
  return Reflect.has(scopeMaps, scope)
    ? scopeMaps[scope as 'eslint']
    : scope.replace('_', '-');
}

export function prefixScope(scope: string) {
  const _scope = convertScope(scope);

  return _scope ? `${_scope}/` : '';
}

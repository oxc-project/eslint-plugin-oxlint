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

export function convertScope(scope: string) {
  return Reflect.has(scopeMaps, scope)
    ? scopeMaps[scope as 'eslint']
    : scope.replace('_', '-');
}

export function prefixScope(scope: string) {
  const _scope = convertScope(scope);

  return _scope ? `${_scope}/` : '';
}

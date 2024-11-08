import path from 'node:path';
import { aliasPluginNames } from '../src/constants.js';

const __dirname = new URL('.', import.meta.url).pathname;

export const TARGET_DIRECTORY = path.resolve(__dirname, '..', '.oxc_sparse');
export const VERSION_PREFIX = 'oxlint_v';
export const SPARSE_CLONE_DIRECTORY = 'crates/oxc_linter/src';

// these are the rules that don't have a direct equivalent in the eslint rules
export const ignoreScope = new Set(['oxc', 'deepscan', 'security']);

export function convertScope(scope: string) {
  return Reflect.has(aliasPluginNames, scope)
    ? aliasPluginNames[scope as 'eslint']
    : scope.replace('_', '-');
}

export function prefixScope(scope: string) {
  const _scope = convertScope(scope);

  return _scope ? `${_scope}/` : '';
}

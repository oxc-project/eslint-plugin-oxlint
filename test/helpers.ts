import type { ESLint } from 'eslint';
import oxlint from '../src/index.js';

export const ESLintTestConfig: ESLint.Options = {
  // @ts-expect-error -- oxlint.configs['flat/all'] is compatible with `Linter.Config | Linter.Config[]`
  baseConfig: oxlint.configs['flat/all'],
  overrideConfigFile: true,
};

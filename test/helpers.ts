import type { ESLint } from 'eslint';
import oxlint from '../src/index.js';

export const ESLintTestConfig: ESLint.Options = {
  baseConfig: oxlint.configs['flat/all'],
  overrideConfigFile: true,
};

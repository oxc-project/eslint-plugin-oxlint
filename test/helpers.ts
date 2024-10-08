import type { ESLint } from 'eslint';
import { FlatCompat } from '@eslint/eslintrc';

const __dirname = new URL('.', import.meta.url).pathname;
const compat = new FlatCompat({ resolvePluginsRelativeTo: __dirname });

export const ESLintTestConfig: ESLint.Options = {
  baseConfig: compat.extends('plugin:oxlint/all'),
};

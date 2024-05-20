import oxlint from './lib/index.cjs';
import unicorn from 'eslint-plugin-unicorn';
import { FlatCompat } from '@eslint/eslintrc';
import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';

const __dirname = new URL('.', import.meta.url).pathname;
const compat = new FlatCompat({ resolvePluginsRelativeTo: __dirname });

export default [
  eslint.configs.recommended,
  unicorn.configs['flat/recommended'],
  ...compat.extends('plugin:@typescript-eslint/recommended'),
  eslintConfigPrettier,
  oxlint.configs['flat/all'],
];

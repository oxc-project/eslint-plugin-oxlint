import oxlint from './lib/index.cjs';
import unicorn from 'eslint-plugin-unicorn';
import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default [
  eslint.configs.recommended,
  unicorn.configs['flat/recommended'],
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  oxlint.configs['flat/all'],
  {
    ignores: ['lib/'],
  },
];

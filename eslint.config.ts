import unicorn from 'eslint-plugin-unicorn';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['dist/**'],
  },
  eslint.configs.recommended,
  unicorn.configs['recommended'],
  ...tseslint.configs.recommended,
];

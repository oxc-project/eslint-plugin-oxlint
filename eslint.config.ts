import oxlint from './src/index.js';
import unicorn from 'eslint-plugin-unicorn';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  eslint.configs.recommended,
  unicorn.configs['flat/recommended'],
  ...tseslint.configs.recommended,
  ...oxlint.buildFromOxlintConfigFile('.oxlintrc.json'),
];

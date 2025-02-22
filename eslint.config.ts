import oxlint from './src/index.js';
import unicorn from 'eslint-plugin-unicorn';
import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default [
  {
    files: ['**/*.ts', '**/*.cts', '**.*.mts'],
  },
  {
    ignores: ['dist/'],
  },
  eslint.configs.recommended,
  unicorn.configs['flat/recommended'],
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  ...oxlint.buildFromOxlintConfigFile('.oxlintrc.json'),
];

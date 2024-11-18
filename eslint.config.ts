import oxlint from './src/index.js';
import unicorn from 'eslint-plugin-unicorn';
import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['dist/'],
  },
  eslint.configs.recommended,
  unicorn.configs['flat/recommended'],
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      // https://github.com/sindresorhus/eslint-plugin-unicorn/issues/2496
      'unicorn/expiring-todo-comments': 'off',
      // https://github.com/eslint/eslint/issues/19134
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
  ...oxlint.buildFromOxlintConfigFile('oxlint.json'),
];

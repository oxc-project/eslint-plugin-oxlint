import { defineConfig, type DummyRuleMap } from 'oxlint';
import unicorn from 'eslint-plugin-unicorn';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default defineConfig({
  plugins: ['unicorn', 'typescript', 'oxc'],
  categories: {
    correctness: 'error',
    suspicious: 'error',
  },
  extends: [],
  rules: {
    ...eslint.configs.recommended.rules,
    ...unicorn.configs['recommended'].rules,
    ...(() => {
      const merged: DummyRuleMap = {};
      for (const config of tseslint.configs.recommended) {
        Object.assign(merged, config.rules);
      }
      return merged;
    })(),
    '@typescript-eslint/no-unsafe-type-assertion': 'off', // FIX: ignore them inline or fix them
    'no-shadow': 'off', // FIX: ignore them inline or fix them
  },
  ignorePatterns: ['dist/'],
  options: {
    typeAware: true,
    typeCheck: true,
  },
});

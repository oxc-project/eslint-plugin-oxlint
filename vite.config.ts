import { defineConfig } from 'vite-plus';
import type { DummyRule, DummyRuleMap } from 'oxlint';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

const esLintRecommended: DummyRuleMap = { ...eslint.configs.recommended.rules };
delete esLintRecommended['no-dupe-args'];
delete esLintRecommended['no-new-symbol'];
delete esLintRecommended['no-octal'];
delete esLintRecommended['no-useless-assignment'];

const typescriptRecommended: DummyRuleMap = {};
for (const config of tseslint.configs.recommended) {
  Object.assign(typescriptRecommended, config.rules);
}

delete typescriptRecommended['no-dupe-args'];
delete typescriptRecommended['no-new-symbol'];

export default defineConfig({
  lint: {
    plugins: ['unicorn', 'typescript', 'oxc'],
    categories: {
      correctness: 'error',
      suspicious: 'error',
    },
    extends: [],
    rules: {
      ...(esLintRecommended as Record<string, DummyRule>),
      ...(typescriptRecommended as Record<string, DummyRule>),
      '@typescript-eslint/no-unsafe-type-assertion': 'off', // FIX: ignore them inline or fix them
      'no-shadow': 'off', // FIX: ignore them inline or fix them
    },
    ignorePatterns: ['dist/'],
    options: { typeAware: true, typeCheck: true },
  },
  staged: {
    '*.{js,cjs,ts}': 'vp lint',
    '*': 'vp fmt .',
  },
  fmt: {
    trailingComma: 'es5',
    tabWidth: 2,
    semi: true,
    singleQuote: true,
    ignorePatterns: ['dist/', '__fixtures__/'],
  },
  test: {
    coverage: {
      include: ['src', 'scripts'],
      exclude: ['**/*.snap'],
    },
  },
  pack: {
    entry: [
      'src/index.ts',
      'src/generated/rules-by-category.ts',
      'src/generated/rules-by-scope.ts',
    ],
    deps: {
      neverBundle: ['eslint', 'oxlint'],
    },
    platform: 'node',
    format: ['cjs', 'esm'],
  },
});

import { defineConfig } from 'oxlint';
import oxlintMigrate from '@oxlint/migrate';
import eslintConfig from './eslint.config.ts';

export default defineConfig(
  // @ts-expect-error - we will fix the type later, for now just make sure the function works as expected
  await oxlintMigrate(eslintConfig, {
    plugins: ['unicorn', 'typescript', 'oxc'],
    categories: {
      correctness: 'error',
      suspicious: 'error',
    },
    rules: {
      '@typescript-eslint/no-unsafe-type-assertion': 'off', // FIX: ignore them inline or fix them
      'no-shadow': 'off', // FIX: ignore them inline or fix them
    },
    ignorePatterns: ['dist/'],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  })
);

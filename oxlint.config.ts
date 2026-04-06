import { defineConfig, type DummyRuleMap } from 'oxlint';
import unicorn from 'eslint-plugin-unicorn';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

const esLintRecommended: DummyRuleMap = { ...eslint.configs.recommended.rules };
delete esLintRecommended['no-dupe-args'];
delete esLintRecommended['no-new-symbol'];
delete esLintRecommended['no-octal'];
delete esLintRecommended['no-useless-assignment'];

// oxlint-disable-next-line typescript/no-unsafe-type-assertion
const uniCornRecommended = { ...unicorn.configs['recommended'].rules } as DummyRuleMap;
delete uniCornRecommended['unicorn/better-regex'];
delete uniCornRecommended['unicorn/consistent-destructuring'];
delete uniCornRecommended['unicorn/consistent-template-literal-escape'];
delete uniCornRecommended['unicorn/expiring-todo-comments'];
delete uniCornRecommended['unicorn/import-style'];
delete uniCornRecommended['unicorn/isolated-functions'];
delete uniCornRecommended['unicorn/no-for-loop'];
delete uniCornRecommended['unicorn/no-keyword-prefix'];
delete uniCornRecommended['unicorn/no-named-default'];
delete uniCornRecommended['unicorn/no-unnecessary-polyfills'];
delete uniCornRecommended['unicorn/no-unused-properties'];
delete uniCornRecommended['unicorn/no-useless-iterator-to-array'];
delete uniCornRecommended['unicorn/prefer-export-from'];
delete uniCornRecommended['unicorn/prefer-import-meta-properties'];
delete uniCornRecommended['unicorn/prefer-json-parse-buffer'];
delete uniCornRecommended['unicorn/prefer-simple-condition-first'];
delete uniCornRecommended['unicorn/prefer-single-call'];
delete uniCornRecommended['unicorn/prefer-switch'];
delete uniCornRecommended['unicorn/prevent-abbreviations'];
delete uniCornRecommended['unicorn/string-content'];
delete uniCornRecommended['unicorn/switch-case-break-position'];
delete uniCornRecommended['unicorn/template-indent'];

const typescriptRecommended: DummyRuleMap = {};
for (const config of tseslint.configs.recommended) {
  Object.assign(typescriptRecommended, config.rules);
}

delete typescriptRecommended['no-dupe-args'];
delete typescriptRecommended['no-new-symbol'];

export default defineConfig({
  plugins: ['unicorn', 'typescript', 'oxc'],
  categories: {
    correctness: 'error',
    suspicious: 'error',
  },
  extends: [],
  rules: {
    ...esLintRecommended,
    ...uniCornRecommended,
    ...typescriptRecommended,
    '@typescript-eslint/no-unsafe-type-assertion': 'off', // FIX: ignore them inline or fix them
    'no-shadow': 'off', // FIX: ignore them inline or fix them
  },
  ignorePatterns: ['dist/'],
  options: {
    typeAware: true,
    typeCheck: true,
  },
});

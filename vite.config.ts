import { defineConfig } from 'vite-plus';
import { DummyRule, type DummyRuleMap } from 'oxlint';
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
delete uniCornRecommended['unicorn/better-dom-traversing'];
delete uniCornRecommended['unicorn/class-reference-in-static-methods'];
delete uniCornRecommended['unicorn/comment-content'];
delete uniCornRecommended['unicorn/consistent-boolean-name'];
delete uniCornRecommended['unicorn/consistent-class-member-order'];
delete uniCornRecommended['unicorn/consistent-compound-words'];
delete uniCornRecommended['unicorn/consistent-conditional-object-spread'];
delete uniCornRecommended['unicorn/consistent-destructuring'];
delete uniCornRecommended['unicorn/consistent-export-decorator-position'];
delete uniCornRecommended['unicorn/consistent-function-style'];
delete uniCornRecommended['unicorn/consistent-json-file-read'];
delete uniCornRecommended['unicorn/consistent-optional-chaining'];
delete uniCornRecommended['unicorn/default-export-style'];
delete uniCornRecommended['unicorn/dom-node-dataset'];
delete uniCornRecommended['unicorn/expiring-todo-comments'];
delete uniCornRecommended['unicorn/explicit-timer-delay'];
delete uniCornRecommended['unicorn/id-match'];
delete uniCornRecommended['unicorn/isolated-functions'];
delete uniCornRecommended['unicorn/logical-assignment-operators'];
delete uniCornRecommended['unicorn/name-replacements'];
delete uniCornRecommended['unicorn/no-accidental-bitwise-operator'];
delete uniCornRecommended['unicorn/no-array-concat-in-loop'];
delete uniCornRecommended['unicorn/no-array-from-fill'];
delete uniCornRecommended['unicorn/no-array-front-mutation'];
delete uniCornRecommended['unicorn/no-array-sort-for-min-max'];
delete uniCornRecommended['unicorn/no-array-splice'];
delete uniCornRecommended['unicorn/no-asterisk-prefix-in-documentation-comments'];
delete uniCornRecommended['unicorn/no-blob-to-file'];
delete uniCornRecommended['unicorn/no-boolean-sort-comparator'];
delete uniCornRecommended['unicorn/no-break-in-nested-loop'];
delete uniCornRecommended['unicorn/no-canvas-to-image'];
delete uniCornRecommended['unicorn/no-chained-comparison'];
delete uniCornRecommended['unicorn/no-collection-bracket-access'];
delete uniCornRecommended['unicorn/no-computed-property-existence-check'];
delete uniCornRecommended['unicorn/no-confusing-array-splice'];
delete uniCornRecommended['unicorn/no-confusing-array-with'];
delete uniCornRecommended['unicorn/no-constant-zero-expression'];
delete uniCornRecommended['unicorn/no-declarations-before-early-exit'];
delete uniCornRecommended['unicorn/no-double-comparison'];
delete uniCornRecommended['unicorn/no-duplicate-if-branches'];
delete uniCornRecommended['unicorn/no-duplicate-logical-operands'];
delete uniCornRecommended['unicorn/no-duplicate-loops'];
delete uniCornRecommended['unicorn/no-duplicate-set-values'];
delete uniCornRecommended['unicorn/no-error-property-assignment'];
delete uniCornRecommended['unicorn/no-exports-in-scripts'];
delete uniCornRecommended['unicorn/no-for-each'];
delete uniCornRecommended['unicorn/no-for-loop'];
delete uniCornRecommended['unicorn/no-global-object-property-assignment'];
delete uniCornRecommended['unicorn/no-impossible-length-comparison'];
delete uniCornRecommended['unicorn/no-incorrect-query-selector'];
delete uniCornRecommended['unicorn/no-incorrect-template-string-interpolation'];
delete uniCornRecommended['unicorn/no-invalid-argument-count'];
delete uniCornRecommended['unicorn/no-invalid-character-comparison'];
delete uniCornRecommended['unicorn/no-invalid-file-input-accept'];
delete uniCornRecommended['unicorn/no-keyword-prefix'];
delete uniCornRecommended['unicorn/no-late-current-target-access'];
delete uniCornRecommended['unicorn/no-loop-iterable-mutation'];
delete uniCornRecommended['unicorn/no-manually-wrapped-comments'];
delete uniCornRecommended['unicorn/no-mismatched-map-key'];
delete uniCornRecommended['unicorn/no-misrefactored-assignment'];
delete uniCornRecommended['unicorn/no-named-default'];
delete uniCornRecommended['unicorn/no-negated-array-predicate'];
delete uniCornRecommended['unicorn/no-negated-comparison'];
delete uniCornRecommended['unicorn/no-non-function-verb-prefix'];
delete uniCornRecommended['unicorn/no-nonstandard-builtin-properties'];
delete uniCornRecommended['unicorn/no-object-methods-with-collections'];
delete uniCornRecommended['unicorn/no-optional-chaining-on-undeclared-variable'];
delete uniCornRecommended['unicorn/no-redundant-comparison'];
delete uniCornRecommended['unicorn/no-return-array-push'];
delete uniCornRecommended['unicorn/no-selector-as-dom-name'];
delete uniCornRecommended['unicorn/no-subtraction-comparison'];
delete uniCornRecommended['unicorn/no-this-outside-of-class'];
delete uniCornRecommended['unicorn/no-top-level-assignment-in-function'];
delete uniCornRecommended['unicorn/no-top-level-side-effects'];
delete uniCornRecommended['unicorn/no-uncalled-method'];
delete uniCornRecommended['unicorn/no-undeclared-class-members'];
delete uniCornRecommended['unicorn/no-unnecessary-boolean-comparison'];
delete uniCornRecommended['unicorn/no-unnecessary-global-this'];
delete uniCornRecommended['unicorn/no-unnecessary-nested-ternary'];
delete uniCornRecommended['unicorn/no-unnecessary-polyfills'];
delete uniCornRecommended['unicorn/no-unnecessary-splice'];
delete uniCornRecommended['unicorn/no-unreadable-for-of-expression'];
delete uniCornRecommended['unicorn/no-unreadable-new-expression'];
delete uniCornRecommended['unicorn/no-unreadable-object-destructuring'];
delete uniCornRecommended['unicorn/no-unsafe-buffer-conversion'];
delete uniCornRecommended['unicorn/no-unsafe-dom-html'];
delete uniCornRecommended['unicorn/no-unsafe-property-key'];
delete uniCornRecommended['unicorn/no-unsafe-string-replacement'];
delete uniCornRecommended['unicorn/no-unused-array-method-return'];
delete uniCornRecommended['unicorn/no-unused-properties'];
delete uniCornRecommended['unicorn/no-useless-boolean-cast'];
delete uniCornRecommended['unicorn/no-useless-coercion'];
delete uniCornRecommended['unicorn/no-useless-compound-assignment'];
delete uniCornRecommended['unicorn/no-useless-concat'];
delete uniCornRecommended['unicorn/no-useless-continue'];
delete uniCornRecommended['unicorn/no-useless-delete-check'];
delete uniCornRecommended['unicorn/no-useless-else'];
delete uniCornRecommended['unicorn/no-useless-logical-operand'];
delete uniCornRecommended['unicorn/no-useless-override'];
delete uniCornRecommended['unicorn/no-useless-recursion'];
delete uniCornRecommended['unicorn/no-useless-template-literals'];
delete uniCornRecommended['unicorn/no-xor-as-exponentiation'];
delete uniCornRecommended['unicorn/operator-assignment'];
delete uniCornRecommended['unicorn/prefer-add-event-listener-options'];
delete uniCornRecommended['unicorn/prefer-array-from-async'];
delete uniCornRecommended['unicorn/prefer-array-from-map'];
delete uniCornRecommended['unicorn/prefer-array-iterable-methods'];
delete uniCornRecommended['unicorn/prefer-array-last-methods'];
delete uniCornRecommended['unicorn/prefer-array-slice'];
delete uniCornRecommended['unicorn/prefer-await'];
delete uniCornRecommended['unicorn/prefer-boolean-return'];
delete uniCornRecommended['unicorn/prefer-continue'];
delete uniCornRecommended['unicorn/prefer-direct-iteration'];
delete uniCornRecommended['unicorn/prefer-dispose'];
delete uniCornRecommended['unicorn/prefer-dom-node-html-methods'];
delete uniCornRecommended['unicorn/prefer-early-return'];
delete uniCornRecommended['unicorn/prefer-else-if'];
delete uniCornRecommended['unicorn/prefer-flat-math-min-max'];
delete uniCornRecommended['unicorn/prefer-get-or-insert-computed'];
delete uniCornRecommended['unicorn/prefer-global-number-constants'];
delete uniCornRecommended['unicorn/prefer-has-check'];
delete uniCornRecommended['unicorn/prefer-hoisting-branch-code'];
delete uniCornRecommended['unicorn/prefer-https'];
delete uniCornRecommended['unicorn/prefer-identifier-import-export-specifiers'];
delete uniCornRecommended['unicorn/prefer-includes-over-repeated-comparisons'];
delete uniCornRecommended['unicorn/prefer-iterable-in-constructor'];
delete uniCornRecommended['unicorn/prefer-iterator-concat'];
delete uniCornRecommended['unicorn/prefer-iterator-to-array'];
delete uniCornRecommended['unicorn/prefer-iterator-to-array-at-end'];
delete uniCornRecommended['unicorn/prefer-location-assign'];
delete uniCornRecommended['unicorn/prefer-map-from-entries'];
delete uniCornRecommended['unicorn/prefer-math-abs'];
delete uniCornRecommended['unicorn/prefer-math-constants'];
delete uniCornRecommended['unicorn/prefer-minimal-ternary'];
delete uniCornRecommended['unicorn/prefer-number-is-safe-integer'];
delete uniCornRecommended['unicorn/prefer-object-define-properties'];
delete uniCornRecommended['unicorn/prefer-object-destructuring-defaults'];
delete uniCornRecommended['unicorn/prefer-object-iterable-methods'];
delete uniCornRecommended['unicorn/prefer-path2d'];
delete uniCornRecommended['unicorn/prefer-private-class-fields'];
delete uniCornRecommended['unicorn/prefer-promise-with-resolvers'];
delete uniCornRecommended['unicorn/prefer-queue-microtask'];
delete uniCornRecommended['unicorn/prefer-regexp-escape'];
delete uniCornRecommended['unicorn/prefer-scoped-selector'];
delete uniCornRecommended['unicorn/prefer-short-arrow-method'];
delete uniCornRecommended['unicorn/prefer-simple-condition-first'];
delete uniCornRecommended['unicorn/prefer-simple-sort-comparator'];
delete uniCornRecommended['unicorn/prefer-single-array-predicate'];
delete uniCornRecommended['unicorn/prefer-single-object-destructuring'];
delete uniCornRecommended['unicorn/prefer-single-replace'];
delete uniCornRecommended['unicorn/prefer-smaller-scope'];
delete uniCornRecommended['unicorn/prefer-split-limit'];
delete uniCornRecommended['unicorn/prefer-string-match-all'];
delete uniCornRecommended['unicorn/prefer-string-pad-start-end'];
delete uniCornRecommended['unicorn/prefer-string-repeat'];
delete uniCornRecommended['unicorn/prefer-switch'];
delete uniCornRecommended['unicorn/prefer-temporal'];
delete uniCornRecommended['unicorn/prefer-type-literal-last'];
delete uniCornRecommended['unicorn/prefer-uint8array-base64'];
delete uniCornRecommended['unicorn/prefer-unary-minus'];
delete uniCornRecommended['unicorn/prefer-unicode-code-point-escapes'];
delete uniCornRecommended['unicorn/prefer-url-can-parse'];
delete uniCornRecommended['unicorn/prefer-url-href'];
delete uniCornRecommended['unicorn/prefer-while-loop-condition'];
delete uniCornRecommended['unicorn/require-array-sort-compare'];
delete uniCornRecommended['unicorn/require-css-escape'];
delete uniCornRecommended['unicorn/require-passive-events'];
delete uniCornRecommended['unicorn/require-proxy-trap-boolean-return'];
delete uniCornRecommended['unicorn/string-content'];
delete uniCornRecommended['unicorn/template-indent'];
delete uniCornRecommended['unicorn/try-complexity'];

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
      ...(uniCornRecommended as Record<string, DummyRule>),
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
  },
  test: {
    coverage: {
      include: ['src', 'scripts'],
    },
  },
  pack: {
    entry: [
      'src/index.ts',
      'src/generated/rules-by-category.ts',
      'src/generated/rules-by-scope.ts',
    ],
    deps: {
      neverBundle: ['eslint'],
    },
    dts: {
      cjsReexport: true,
    },
    platform: 'node',
    format: ['cjs', 'esm'],
  },
});

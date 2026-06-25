import { defineConfig } from 'vite-plus';
import { DummyRule, type DummyRuleMap } from 'oxlint';
import unicorn from 'eslint-plugin-unicorn';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

const esLintRecommended: DummyRuleMap = { ...eslint.configs.recommended.rules };
const unsupportedESLintRules = [
  'no-dupe-args',
  'no-new-symbol',
  'no-octal',
  'no-useless-assignment',
];

for (const rule of unsupportedESLintRules) {
  // oxlint-disable-next-line unicorn-js/no-top-level-side-effects
  delete esLintRecommended[rule];
}

const unsupportedUnicornRules = [
  'better-dom-traversing',
  'class-reference-in-static-methods',
  'comment-content',
  'consistent-boolean-name',
  'consistent-class-member-order',
  'consistent-compound-words',
  'consistent-conditional-object-spread',
  'consistent-destructuring',
  'consistent-export-decorator-position',
  'consistent-function-style',
  'consistent-json-file-read',
  'consistent-optional-chaining',
  'default-export-style',
  'dom-node-dataset',
  'expiring-todo-comments',
  'explicit-timer-delay',
  'id-match',
  'isolated-functions',
  'logical-assignment-operators',
  'name-replacements',
  'no-accidental-bitwise-operator',
  'no-array-concat-in-loop',
  'no-array-from-fill',
  'no-array-front-mutation',
  'no-array-sort-for-min-max',
  'no-array-splice',
  'no-asterisk-prefix-in-documentation-comments',
  'no-blob-to-file',
  'no-boolean-sort-comparator',
  'no-break-in-nested-loop',
  'no-canvas-to-image',
  'no-chained-comparison',
  'no-collection-bracket-access',
  'no-computed-property-existence-check',
  'no-confusing-array-splice',
  'no-confusing-array-with',
  'no-constant-zero-expression',
  'no-declarations-before-early-exit',
  'no-double-comparison',
  'no-duplicate-if-branches',
  'no-duplicate-logical-operands',
  'no-duplicate-loops',
  'no-duplicate-set-values',
  'no-error-property-assignment',
  'no-exports-in-scripts',
  'no-for-each',
  'no-for-loop',
  'no-global-object-property-assignment',
  'no-impossible-length-comparison',
  'no-incorrect-query-selector',
  'no-incorrect-template-string-interpolation',
  'no-invalid-argument-count',
  'no-invalid-character-comparison',
  'no-invalid-file-input-accept',
  'no-keyword-prefix',
  'no-late-current-target-access',
  'no-loop-iterable-mutation',
  'no-manually-wrapped-comments',
  'no-mismatched-map-key',
  'no-misrefactored-assignment',
  'no-named-default',
  'no-negated-array-predicate',
  'no-negated-comparison',
  'no-non-function-verb-prefix',
  'no-nonstandard-builtin-properties',
  'no-object-methods-with-collections',
  'no-optional-chaining-on-undeclared-variable',
  'no-redundant-comparison',
  'no-return-array-push',
  'no-selector-as-dom-name',
  'no-subtraction-comparison',
  'no-this-outside-of-class',
  'no-top-level-assignment-in-function',
  'no-top-level-side-effects',
  'no-uncalled-method',
  'no-undeclared-class-members',
  'no-unnecessary-boolean-comparison',
  'no-unnecessary-global-this',
  'no-unnecessary-nested-ternary',
  'no-unnecessary-polyfills',
  'no-unnecessary-splice',
  'no-unreadable-for-of-expression',
  'no-unreadable-new-expression',
  'no-unreadable-object-destructuring',
  'no-unsafe-buffer-conversion',
  'no-unsafe-dom-html',
  'no-unsafe-property-key',
  'no-unsafe-string-replacement',
  'no-unused-array-method-return',
  'no-unused-properties',
  'no-useless-boolean-cast',
  'no-useless-coercion',
  'no-useless-compound-assignment',
  'no-useless-concat',
  'no-useless-continue',
  'no-useless-delete-check',
  'no-useless-else',
  'no-useless-logical-operand',
  'no-useless-override',
  'no-useless-recursion',
  'no-useless-template-literals',
  'no-xor-as-exponentiation',
  'operator-assignment',
  'prefer-add-event-listener-options',
  'prefer-array-from-async',
  'prefer-array-from-map',
  'prefer-array-iterable-methods',
  'prefer-array-last-methods',
  'prefer-array-slice',
  'prefer-await',
  'prefer-boolean-return',
  'prefer-continue',
  'prefer-direct-iteration',
  'prefer-dispose',
  'prefer-dom-node-html-methods',
  'prefer-early-return',
  'prefer-else-if',
  'prefer-flat-math-min-max',
  'prefer-get-or-insert-computed',
  'prefer-global-number-constants',
  'prefer-has-check',
  'prefer-hoisting-branch-code',
  'prefer-https',
  'prefer-identifier-import-export-specifiers',
  'prefer-includes-over-repeated-comparisons',
  'prefer-iterable-in-constructor',
  'prefer-iterator-concat',
  'prefer-iterator-to-array',
  'prefer-iterator-to-array-at-end',
  'prefer-location-assign',
  'prefer-map-from-entries',
  'prefer-math-abs',
  'prefer-math-constants',
  'prefer-minimal-ternary',
  'prefer-number-is-safe-integer',
  'prefer-object-define-properties',
  'prefer-object-destructuring-defaults',
  'prefer-object-iterable-methods',
  'prefer-path2d',
  'prefer-private-class-fields',
  'prefer-promise-with-resolvers',
  'prefer-queue-microtask',
  'prefer-regexp-escape',
  'prefer-scoped-selector',
  'prefer-short-arrow-method',
  'prefer-simple-condition-first',
  'prefer-simple-sort-comparator',
  'prefer-single-array-predicate',
  'prefer-single-object-destructuring',
  'prefer-single-replace',
  'prefer-smaller-scope',
  'prefer-split-limit',
  'prefer-string-match-all',
  'prefer-string-pad-start-end',
  'prefer-string-repeat',
  'prefer-switch',
  'prefer-temporal',
  'prefer-type-literal-last',
  'prefer-uint8array-base64',
  'prefer-unary-minus',
  'prefer-unicode-code-point-escapes',
  'prefer-url-can-parse',
  'prefer-url-href',
  'prefer-while-loop-condition',
  'require-array-sort-compare',
  'require-css-escape',
  'require-passive-events',
  'require-proxy-trap-boolean-return',
  'string-content',
  'template-indent',
  'try-complexity',
];

// oxlint-disable-next-line typescript/no-unsafe-type-assertion
const uniCornRecommended = { ...unicorn.configs['recommended'].rules } as DummyRuleMap;
for (const rule of unsupportedUnicornRules) {
  // oxlint-disable-next-line unicorn-js/no-top-level-side-effects
  delete uniCornRecommended[`unicorn/${rule}`];
}

const typescriptRecommended: DummyRuleMap = {};
for (const config of tseslint.configs.recommended) {
  Object.assign(typescriptRecommended, config.rules);
}

// oxlint-disable-next-line unicorn-js/no-top-level-side-effects
delete typescriptRecommended['no-dupe-args'];
// oxlint-disable-next-line unicorn-js/no-top-level-side-effects
delete typescriptRecommended['no-new-symbol'];

export default defineConfig({
  lint: {
    plugins: ['unicorn', 'typescript', 'oxc'],
    jsPlugins: [
      {
        name: 'unicorn-js',
        specifier: 'eslint-plugin-unicorn',
      },
    ],
    categories: {
      correctness: 'error',
      suspicious: 'error',
    },
    extends: [],
    rules: {
      ...(esLintRecommended as Record<string, DummyRule>),
      ...(uniCornRecommended as Record<string, DummyRule>),
      ...(typescriptRecommended as Record<string, DummyRule>),
      ...Object.fromEntries(
        unsupportedUnicornRules.map((rule) => [
          `unicorn-js/${rule}`,
          unicorn.configs['recommended'].rules![`unicorn/${rule}`],
        ])
      ),
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

// these are the mappings from the scope in the rules.rs to the eslint scope
// only used for the scopes where the directory structure doesn't reflect the eslint scope
// such as `typescript` vs `@typescript-eslint` or others. Eslint as a scope is an exception,
// as eslint doesn't have a scope.
// look here: <https://github.com/oxc-project/oxc/blob/0b329516372a0353e9eb18e5bc0fbe63bce21fee/crates/oxc_linter/src/config/rules.rs#L285>
export const aliasPluginNames: Record<string, string> = {
  // for scripts/generate and src/build-from-oxlint-config
  eslint: '',
  typescript: '@typescript-eslint',
  nextjs: '@next/next',
  node: 'n',

  // only for src/build-from-oxlint-config
  react_perf: 'react-perf',
  jsx_a11y: 'jsx-a11y',
  'import-x': 'import',
};

// `aliasPluginNames` maps one oxlint plugin to exactly one ESLint plugin, but some oxlint
// plugins carry rules that upstream live in *several* ESLint plugins. These are the extra
// prefixes a plugin can emit, on top of its `aliasPluginNames` entry.
// Without this, enabling an oxlint plugin via `categories` never switches off the rules it
// owns under a different prefix -- see `reactHookRulesInsideReactScope` and
// `react-refresh/only-export-components`.
export const additionalEslintPluginPrefixes: Record<string, string[]> = {
  react: ['react-hooks', 'react-refresh'],
};

// Some typescript-eslint rules are re-implemented version of eslint rules.
// Since oxlint supports these rules under eslint/* and it also supports TS,
// we should override these to make implementation status up-to-date.
// remapping in source-code: <https://github.com/oxc-project/oxc/blob/814eab656291a7d809de808bf4a717bcfa483430/crates/oxc_linter/src/utils/mod.rs>
export const typescriptRulesExtendEslintRules = [
  'class-methods-use-this',
  'default-param-last',
  'init-declarations',
  'max-params',
  'no-array-constructor',
  'no-dupe-class-members',
  'no-empty-function',
  'no-invalid-this',
  'no-loop-func',
  'no-loss-of-precision',
  'no-magic-numbers',
  'no-redeclare',
  'no-restricted-imports',
  'no-shadow',
  'no-unused-expressions',
  'no-unused-vars',
  'no-use-before-define',
  'no-useless-constructor',
];

// All rules from `eslint-plugin-react-hooks`
// Since oxlint supports these rules under react/*, we need to remap them.
// Keep this in sync with oxlint's `react` scope: every rule oxlint namespaces under
// `react/` that upstream ships in `eslint-plugin-react-hooks` (rather than
// `eslint-plugin-react`) belongs here, otherwise we emit `react/<rule>: off`, which
// matches no real ESLint rule and silently leaves the `react-hooks/<rule>` copy running.
// Most of these are the React Compiler rules, ported into oxlint's `react` plugin.
export const reactHookRulesInsideReactScope = [
  'capitalized-calls',
  'error-boundaries',
  'exhaustive-deps',
  'exhaustive-effect-dependencies',
  'globals',
  'hooks',
  'immutability',
  'incompatible-library',
  'invariant',
  'memo-dependencies',
  'no-deriving-state-in-effects',
  'preserve-manual-memoization',
  'purity',
  'refs',
  'rule-suppression',
  'rules-of-hooks',
  'set-state-in-effect',
  'set-state-in-render',
  'static-components',
  'syntax',
  'todo',
  'unsupported-syntax',
  'use-memo',
  'void-use-memo',
];

// These rules are disabled for vue, astro, and svelte files
// because oxlint can not parse currently the HTML
export const rulesDisabledForVueAstroAndSvelteFiles = [
  'no-unused-vars',
  '@typescript-eslint/no-unused-vars',
  '@typescript-eslint/consistent-type-imports',
  'react-hooks/rules-of-hooks', // disabled because its react
];

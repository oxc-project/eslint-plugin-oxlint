# eslint-plugin-oxlint

![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/oxc-project/eslint-plugin-oxlint/.github%2Fworkflows%2Ftest.yml?branch=main)
![NPM Version](https://img.shields.io/npm/v/eslint-plugin-oxlint) ![NPM Downloads](https://img.shields.io/npm/dm/eslint-plugin-oxlint)

Turn off all rules already supported by [`oxlint`](https://oxc.rs/docs/guide/usage/linter). The rules are extracted from [here](https://github.com/oxc-project/oxc/blob/main/crates/oxc_linter/src/rules.rs).

## Installation

```shell
pnpm add -D eslint-plugin-oxlint
```

## Usage

### Run oxlint before eslint

Add the following script to your `package.json`:

```json
{
  "scripts": {
    "lint": "oxlint && eslint"
  }
}
```

### Flat config

This plugin is optimized for flat config usage (eslint >= 9.0). See [here](https://eslint.org/docs/latest/use/configure/configuration-files-new) for more details.

Example:

```js
// eslint.config.js
import oxlint from 'eslint-plugin-oxlint';
export default [
  ...// other plugins
  ...oxlint.configs['flat/recommended'], // oxlint should be the last one
];
```

### Legacy config

If you are using legacy configuration (eslint < 9.0), you can use the following config:

```js
// .eslintrc.js
module.exports = {
  ... // other config
  extends: [
    ... // other presets
    "plugin:oxlint/recommended",
  ],
}
```

### Detect rules from `.oxlintrc.json`

If you are using flat configuration (eslint >= 9.0), you can use the following config:

```js
// eslint.config.js
import oxlint from 'eslint-plugin-oxlint';
export default [
  ..., // other plugins
  ...oxlint.buildFromOxlintConfigFile('./.oxlintrc.json'),
];
```

Or build it by an `.oxlintrc.json`-like object:

```js
// eslint.config.js
import oxlint from 'eslint-plugin-oxlint';
export default [
  ..., // other plugins
  ...oxlint.buildFromOxlintConfig({
    categories: {
      correctness: 'warn'
    },
    rules: {
      eqeqeq: 'warn'
    }
  }),
];
```

`buildFromOxlintConfigFile` is not supported for legacy configuration (eslint < 9.0).

## All Configs

```js
  configs: {
    // recommended only contains the `correctness` category
    recommended: { plugins: [Array], rules: [Object] },
    'flat/recommended': { rules: [Object] },

    // all rules available
    all: { plugins: [Array], rules: [Object] },
    'flat/all': { rules: [Object] },

    // turn eslint rules off by plugin
    'flat/eslint': { rules: [Object] },
    'flat/import': { rules: [Object] },
    'flat/jest': { rules: [Object] },
    'flat/jsdoc': { rules: [Object] },
    'flat/jsx-a11y': { rules: [Object] },
    'flat/nextjs': { rules: [Object] },
    'flat/react': { rules: [Object] },
    'flat/react-perf': { rules: [Object] },
    'flat/tree-shaking': { rules: [Object] },
    'flat/typescript': { rules: [Object] },
    'flat/unicorn': { rules: [Object] },

    // turn eslint rules off by oxlint category
    'flat/pedantic': { rules: [Object] },
    'flat/style': { rules: [Object] },
    'flat/correctness': { rules: [Object] },
    'flat/restriction': { rules: [Object] },
    'flat/suspicious': { rules: [Object] }
  }
```

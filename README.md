# eslint-plugin-oxlint

![NPM Version](https://img.shields.io/npm/v/eslint-plugin-oxlint) ![NPM Downloads](https://img.shields.io/npm/dm/eslint-plugin-oxlint)

Turn off all rules already supported by `oxlint`. The rules are extracted from [here](https://github.com/oxc-project/oxc/blob/main/crates/oxc_linter/src/rules.rs)

## What is oxlint?

You can see https://oxc-project.github.io/blog/2023-12-12-announcing-oxlint.html

## Installation

```shell
pnpm add eslint-plugin-oxlint --D
```

## Usage

### Flat config

This plugin is optimized for flat config usage (eslint >= 9.0). See [here](https://eslint.org/docs/latest/use/configure/configuration-files-new) for more details. Use it like this:

```js
// eslint.config.js
import oxlint from "eslint-plugin-oxlint";
export default [
  ...// other plugins
  oxlint.configs["flat/recommended"], // oxlint should be the last one
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

### Run it before eslint

And then you can add the following script to your `package.json`:

```json
{
  "scripts": {
    "lint": "npx oxlint && npx eslint"
  }
}
```

## VSCode Support

You need to install both the [oxc](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode) and [eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) extensions

## License

[MIT](https://github.com/Dunqing/eslint-plugin-oxlint/blob/main/LICENSE)

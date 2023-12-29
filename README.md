# eslint-plugin-oxlint

Turn off all rules already supported by `oxlint`. The rules extracted from [here](https://github.com/oxc-project/oxc/blob/main/crates/oxc_linter/src/rules.rs)

## What is oxlint?

You can see https://oxc-project.github.io/blog/2023-12-12-announcing-oxlint.html

## Installation

```shell
pnpm add eslint-plugin-oxlint --D
```

## Usage

This is a flat config usage.

```js
// eslint.config.js
import oxlint from "eslint-plugin-oxlint"
export default [
  ... // other plugins
  // oxlint should be the last one
  oxlint,
]
```

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

import oxlint from "./index.js"
import unicorn from "eslint-plugin-unicorn"
import { FlatCompat } from '@eslint/eslintrc'
import eslint from "@eslint/js"

const __dirname = new URL(".", import.meta.url).pathname;
const compat = new FlatCompat({ resolvePluginsRelativeTo: __dirname });

export default [
    eslint.configs.recommended,
    oxlint,
    unicorn.configs["flat/recommended"],
    ...compat.extends("plugin:@typescript-eslint/recommended"),
]
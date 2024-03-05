import { ESLint } from "eslint";

export const ESLintTestConfig: ESLint.Options = {
  useEslintrc: false,
  baseConfig: {
    extends: ["plugin:oxlint/recommended"],
  },
};

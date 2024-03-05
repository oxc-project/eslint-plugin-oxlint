import { expect, it } from "vitest";
import { ESLint } from "eslint";

const CONFIG: ESLint.Options = {
  baseConfig: {
    extends: ["plugin:oxlint/recommended"],
  },
};

it("contains all the oxlint rules", async () => {
  const eslint = new ESLint(CONFIG);
  const config = await eslint.calculateConfigForFile("index.js");
  expect(config.rules).toMatchSnapshot();
});

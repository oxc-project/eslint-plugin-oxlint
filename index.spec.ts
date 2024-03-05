import { expect, test } from "vitest";
import { ESLint } from "eslint";

const CONFIG: ESLint.Options = {
  baseConfig: {
    extends: ["plugin:oxlint/recommended"],
  },
};

test("oxlint-managed rules are disabled", async () => {
  const eslint = new ESLint(CONFIG);
  const config = await eslint.calculateConfigForFile("index.js");
  expect(config.rules["eqeqeq"]).toEqual(["off"]);
});

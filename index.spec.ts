import { expect, test } from "vitest";
import { ESLint } from "eslint";

import { ESLintTestConfig } from "./helpers.js";

test("oxlint-managed rules are disabled", async () => {
  const eslint = new ESLint(ESLintTestConfig);
  const config = await eslint.calculateConfigForFile("index.js");
  expect(config.rules.eqeqeq).toEqual(["off"]);
});

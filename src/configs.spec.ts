import { expect, it } from 'vitest';
import { ESLint } from 'eslint';
import { ESLintTestConfig } from '../test/helpers.js';

it('contains all the oxlint rules', async () => {
  const eslint = new ESLint(ESLintTestConfig);
  const config = await eslint.calculateConfigForFile('index.js');
  expect(config.rules).toMatchSnapshot();
});

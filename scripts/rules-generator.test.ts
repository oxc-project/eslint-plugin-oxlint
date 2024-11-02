import { test, suite, expect } from 'vitest';
import { RulesGenerator, RulesGrouping } from './rules-generator.js';
import type { Rule } from './traverse-rules.js';

suite('RulesGenerator', () => {
  test('RulesGenerator generates rules correctly', async () => {
    const successResultArray: Rule[] = [
      {
        category: 'style',
        scope: 'eslint',
        value: 'rulename-with-mod',
      },
      {
        category: 'correctness',
        scope: 'typescript',
        value: '@typescript-eslint/rulename-without-mod',
      },
    ];

    // Create an instance of RulesGenerator
    const generator = new RulesGenerator(
      successResultArray,
      RulesGrouping.SCOPE
    );

    // Call the generateRules method
    expect(await generator.generateRulesCode()).toMatchSnapshot('byScope');

    generator.setRulesGrouping(RulesGrouping.CATEGORY);
    // Call the generateRules method
    expect(await generator.generateRulesCode()).toMatchSnapshot('byCategory');
  });
});

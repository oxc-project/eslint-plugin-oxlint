import { describe, expect, it } from 'vitest';
import { handleRulesScope } from './rules.js';

describe('handleRulesScope', () => {
  for (const ruleSetting of [
    'error',
    ['error'],
    'warn',
    ['warn'],
    1,
    [1],
    2,
    [2],
  ]) {
    it(`detect active rule ${JSON.stringify(ruleSetting)} inside "rules" scope`, () => {
      const rules = {};
      handleRulesScope(
        {
          eqeqeq: ruleSetting,
        },
        rules
      );

      expect(rules).toStrictEqual({
        eqeqeq: 'off',
      });
    });
  }

  for (const ruleSetting of ['off', ['off'], 0, [0]]) {
    it(`skip deactive rule ${JSON.stringify(ruleSetting)} inside "rules" scope`, () => {
      const rules = {};
      handleRulesScope(
        {
          eqeqeq: ruleSetting,
        },
        rules
      );

      expect(rules).toStrictEqual({});
    });
  }

  for (const ruleSetting of ['on', ['on'], 3, [3]]) {
    it(`skip invalid ${JSON.stringify(ruleSetting)} inside "rules" scope`, () => {
      const rules = {};
      handleRulesScope(
        {
          eqeqeq: ruleSetting,
        },
        rules
      );

      expect(rules).toStrictEqual({});
    });
  }
});

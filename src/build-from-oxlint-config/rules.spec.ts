import { describe, expect, it } from 'vitest';
import { handleRulesScope } from './rules.js';
import { unicornRulesExtendEslintRules, viteTestCompatibleRules } from '../constants.js';

describe('handleRulesScope', () => {
  for (const ruleSetting of ['error', ['error'], 'warn', ['warn'], 1, [1], 2, [2]]) {
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

  // look here: <https://github.com/oxc-project/oxc/blob/542bbd77ed50ad037c275b3af169b1edfab59988/crates/oxc_linter/src/config/rules.rs#L283-L296>
  it('detects oxlint rules with plugin alias inside rules block', () => {
    const rules = {};
    handleRulesScope(
      {
        'eslint/eqeqeq': 'warn',
        'typescript/no-unused-vars': 'warn',
        'react_perf/jsx-no-new-array-as-prop': 'warn',
        'nextjs/no-img-element': 'warn',
        'jsx_a11y/alt-text': 'warn',
        'react/rules-of-hooks': 'warn',
        'import-x/namespace': 'warn',
        // 'deepscan/xxx': 'warn',
      },
      rules
    );

    expect(rules).toStrictEqual({
      eqeqeq: 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'react-perf/jsx-no-new-array-as-prop': 'off',
      '@next/next/no-img-element': 'off',
      'jsx-a11y/alt-text': 'off',
      'react-hooks/rules-of-hooks': 'off',
      'import/namespace': 'off',
    });
  });

  it('detects rules without plugin name', () => {
    const rules = {};
    handleRulesScope(
      {
        'no-unused-vars': 'warn',
        'jsx-no-new-array-as-prop': 'warn',
        'no-img-element': 'warn',
        'no-array-reduce': 'warn',
      },
      rules
    );

    expect(rules).toStrictEqual({
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off', // TypeScript alias is also disabled
      'react-perf/jsx-no-new-array-as-prop': 'off',
      '@next/next/no-img-element': 'off',
      'unicorn/no-array-reduce': 'off',
    });
  });

  it('skips unknown oxlint rules', () => {
    const rules = {};
    handleRulesScope(
      {
        unknown: 'warn',
        'typescript/no-img-element': 'warn', // valid rule, but wrong plugin-name
      },
      rules
    );

    expect(rules).toStrictEqual({});
  });

  for (const alias of viteTestCompatibleRules) {
    it(`disables vitest jest alias rules for ${alias}`, () => {
      for (const rule of [`jest/${alias}`, `vitest/${alias}`]) {
        const rules = {};
        handleRulesScope(
          {
            [rule]: 'warn',
          },
          rules
        );

        expect(rules).toStrictEqual({
          [rule]: 'off',
        });
      }
    });
  }

  for (const alias of unicornRulesExtendEslintRules) {
    it(`disables unicorn eslint alias rules for ${alias}`, () => {
      for (const rule of [`unicorn/${alias}`, alias]) {
        const rules = {};
        handleRulesScope(
          {
            [rule]: 'warn',
          },
          rules
        );

        expect(rules).toStrictEqual({
          [rule]: 'off',
        });
      }
    });
  }

  describe('type-aware rules', () => {
    it('should filter out type-aware rules by default', () => {
      const rules = {};
      handleRulesScope(
        {
          '@typescript-eslint/await-thenable': 'error',
          '@typescript-eslint/no-unused-vars': 'error',
        },
        rules
      );

      expect(rules).toStrictEqual({
        '@typescript-eslint/no-unused-vars': 'off',
      });
    });

    it('should include type-aware rules when typeAware is true', () => {
      const rules = {};
      handleRulesScope(
        {
          '@typescript-eslint/await-thenable': 'error',
          '@typescript-eslint/no-unused-vars': 'error',
        },
        rules,
        { typeAware: true }
      );

      expect(rules).toStrictEqual({
        '@typescript-eslint/await-thenable': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      });
    });

    it('should filter multiple type-aware rules', () => {
      const rules = {};
      handleRulesScope(
        {
          '@typescript-eslint/no-unsafe-call': 'error',
          '@typescript-eslint/no-floating-promises': 'warn',
          eqeqeq: 'error',
        },
        rules
      );

      expect(rules).toStrictEqual({
        eqeqeq: 'off',
      });
    });
  });

  describe('TypeScript alias rules', () => {
    it('should disable TypeScript alias rules when ESLint base rules are active', () => {
      const rules = {};
      handleRulesScope(
        {
          'no-unused-vars': 'error',
          'no-redeclare': 'warn',
          'no-loop-func': 'error',
        },
        rules
      );

      expect(rules).toStrictEqual({
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'no-redeclare': 'off',
        '@typescript-eslint/no-redeclare': 'off',
        'no-loop-func': 'off',
        '@typescript-eslint/no-loop-func': 'off',
      });
    });

    it('should not add TypeScript alias for rules that do not have one', () => {
      const rules = {};
      handleRulesScope(
        {
          eqeqeq: 'error',
        },
        rules
      );

      expect(rules).toStrictEqual({
        eqeqeq: 'off',
      });
    });

    it('should disable both base and alias when base rule is turned off', () => {
      const rules = {
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      };
      handleRulesScope(
        {
          'no-unused-vars': 'off',
        },
        rules
      );

      expect(rules).toStrictEqual({});
    });
  });
});

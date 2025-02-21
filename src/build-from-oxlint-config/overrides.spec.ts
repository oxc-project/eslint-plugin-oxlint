import { describe, expect, it } from 'vitest';
import { handleOverridesScope } from './overrides.js';

describe('handleOverridesScope', () => {
  it('supports simple files + rules overrides', () => {
    const configs = [
      {
        rules: {
          eqeqeq: 'off',
        } as const,
      },
    ];
    handleOverridesScope(
      [
        {
          files: ['./*.ts'],
          rules: {
            'no-alert': 'error',
          },
        },
      ],
      configs
    );

    expect(configs).toStrictEqual([
      {
        rules: {
          eqeqeq: 'off',
        },
      },
      {
        name: 'oxlint/from-oxlint-config-override-0',
        files: ['./*.ts'],
        rules: {
          'no-alert': 'off',
        },
      },
    ]);
  });

  it('supports simple files + plugins overrides', () => {
    const configs = [
      {
        rules: {
          eqeqeq: 'off',
        } as const,
      },
    ];
    handleOverridesScope(
      [
        {
          files: ['./*.test.ts'],
          plugins: ['vitest'],
        },
      ],
      configs,
      {
        correctness: 'warn',
      }
    );

    expect(configs.length).toBe(2);

    expect(configs[0]).toStrictEqual({
      rules: {
        eqeqeq: 'off',
      },
    });

    expect(configs[1].rules.eqeqeq).toBe(undefined);
    // @ts-expect-error -- because we are using const no other rule then eqeqeq is allowed
    expect(configs[1].rules['vitest/no-conditional-tests']).toBe('off');
  });

  it('rule in overrides', () => {
    const configs = [
      {
        rules: {
          'no-debugger': 'off',
        } as const,
      },
    ];
    handleOverridesScope(
      [
        {
          files: ['./*.test.ts'],
          rules: {
            'no-debugger': 'off',
          },
        },
      ],
      configs
    );

    expect(configs).toStrictEqual([
      {
        rules: {
          'no-debugger': 'off',
        },
      },
      {
        name: 'oxlint/from-oxlint-config-override-0',
        files: ['./*.test.ts'],
        rules: {},
      },
    ]);
  });
});

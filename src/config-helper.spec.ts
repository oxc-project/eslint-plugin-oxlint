import { describe, expect, it } from 'vitest';
import { overrideDisabledRulesForVueAndSvelteFiles } from './config-helper.js';

describe('disabledSpecificRulesOnlyForVueAndSvelteFiles', () => {
  it('does not create an override when no matching rule detected', () => {
    const config = {
      rules: {
        'no-magic-numbers': 'off',
      },
    } as const;

    const newConfig = overrideDisabledRulesForVueAndSvelteFiles(config);

    expect(newConfig).toStrictEqual({
      rules: {
        'no-magic-numbers': 'off',
      },
    });
  });

  it('creates override when matching rule detected', () => {
    const config = {
      rules: {
        'no-magic-numbers': 'off',
        'no-unused-vars': 'off',
      },
    } as const;

    const newConfig = overrideDisabledRulesForVueAndSvelteFiles(config);

    expect(newConfig).toStrictEqual({
      rules: {
        'no-magic-numbers': 'off',
      },
      overrides: [
        {
          files: ['!*.vue', '!*.svelte'],
          rules: {
            'no-unused-vars': 'off',
          },
        },
      ],
    });
  });
});

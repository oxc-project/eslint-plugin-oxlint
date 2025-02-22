import { describe, expect, it } from 'vitest';
import {
  overrideDisabledRulesForVueAndSvelteFiles,
  splitDisabledRulesForVueAndSvelteFiles,
} from './config-helper.js';

describe('overrideDisabledRulesForVueAndSvelteFiles', () => {
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
          files: ['*.*'],
          excludedFiles: ['*.vue', '*.svelte'],
          rules: {
            'no-unused-vars': 'off',
          },
        },
      ],
    });
  });
});

describe('splitDisabledRulesForVueAndSvelteFiles', () => {
  it('does not create a second config when no matching rule detected', () => {
    const config = {
      rules: {
        'no-magic-numbers': 'off',
      },
    } as const;

    const newConfigs = splitDisabledRulesForVueAndSvelteFiles(config);

    expect(newConfigs).toStrictEqual([
      {
        rules: {
          'no-magic-numbers': 'off',
        },
      },
    ]);
  });

  it('creates a second config when no matching rule detected', () => {
    const config = {
      rules: {
        'no-magic-numbers': 'off',
        'no-unused-vars': 'off',
      },
    } as const;

    const newConfigs = splitDisabledRulesForVueAndSvelteFiles(config);

    expect(newConfigs).toStrictEqual([
      {
        rules: {
          'no-magic-numbers': 'off',
        },
      },
      {
        name: 'oxlint/vue-svelte-exceptions',
        ignores: ['**/*.vue', '**/*.svelte'],
        rules: {
          'no-unused-vars': 'off',
        },
      },
    ]);
  });
});

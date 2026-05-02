import { describe, expect, it } from 'vite-plus/test';
import {
  overrideDisabledRulesForVueAndSvelteFiles,
  splitDisabledRulesForVueAstroAndSvelteFiles,
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
          excludedFiles: ['*.vue', '*.svelte', '*.astro'],
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

    const newConfigs = splitDisabledRulesForVueAstroAndSvelteFiles(config);

    expect(newConfigs).toStrictEqual([
      {
        rules: {
          'no-magic-numbers': 'off',
        },
      },
    ]);
  });

  it('creates a second config when matching rule detected', () => {
    const config = {
      rules: {
        'no-magic-numbers': 'off',
        'no-unused-vars': 'off',
      },
    } as const;

    const newConfigs = splitDisabledRulesForVueAstroAndSvelteFiles(config);

    expect(newConfigs).toStrictEqual([
      {
        rules: {
          'no-magic-numbers': 'off',
        },
      },
      {
        name: 'oxlint/vue-svelte-astro-exceptions',
        ignores: ['**/*.vue', '**/*.svelte', '**/*.astro'],
        rules: {
          'no-unused-vars': 'off',
        },
      },
    ]);
  });
});

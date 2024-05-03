import { vi, test, suite, vitest, beforeEach, afterEach, expect } from 'vitest';
import { vol } from 'memfs';
import { RulesGenerator, RulesGrouping } from './rules-generator.js';
import type { Rule } from './traverse-rules.js';

suite('RulesGenerator', () => {
  beforeEach(() => {
    vi.mock('node:fs', async () => {
      const memfs: typeof import('memfs') = await vi.importActual('memfs');

      return {
        default: memfs.fs,
        ...memfs.fs,
      };
    });

    vi.mock('./oxlint-version.ts', () => ({
      getLatestVersionFromClonedRepo: vitest.fn().mockReturnValue('1.0.0'),
    }));
  });

  afterEach(() => {
    vol.reset();
    vi.resetAllMocks();
  });

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

    // use a fake src folder
    vol.fromJSON({
      src: null,
    });

    // Create an instance of RulesGenerator
    const generator = new RulesGenerator(
      successResultArray,
      RulesGrouping.SCOPE
    );

    // Call the generateRules method
    await generator.generateRules();
    expect(vol.toJSON()).toMatchSnapshot('byScope');
    generator.setRulesGrouping(RulesGrouping.CATEGORY);

    // Call the generateRules method
    await generator.generateRules();
    expect(vol.toJSON()).toMatchSnapshot('byCategory');
  });
});

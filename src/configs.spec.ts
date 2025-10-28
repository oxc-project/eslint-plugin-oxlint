import { expect, it, describe } from 'vitest';
import { ESLint } from 'eslint';
import { ESLintTestConfig } from '../test/helpers.js';
import configs from './configs.js';
import { nurseryRules } from './generated/rules-by-category.js';

it('contains all the oxlint rules', async () => {
  const eslint = new ESLint(ESLintTestConfig);
  const config = await eslint.calculateConfigForFile('index.js');
  expect(config.rules).toMatchSnapshot();
});

describe('nursery rules in configs', () => {
  it('should not include nursery rules in "all" config', () => {
    const allConfig = configs.all;
    expect(allConfig.rules).toBeDefined();

    // Check that none of the nursery rules are in the "all" config
    for (const nurseryRule of Object.keys(nurseryRules)) {
      expect(nurseryRule in allConfig.rules!).toBe(false);
    }
  });

  it('should not include nursery rules in "flat/all" config', () => {
    const flatAllConfigs = configs['flat/all'];

    // flat/all returns an array of configs
    for (const config of flatAllConfigs) {
      if (config.rules) {
        // Check that none of the nursery rules are in the config
        for (const nurseryRule of Object.keys(nurseryRules)) {
          expect(nurseryRule in config.rules).toBe(false);
        }
      }
    }
  });
});

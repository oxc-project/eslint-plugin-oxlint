import { describe, expect, it } from 'vitest';
import {
  buildFromOxlintConfig,
  buildFromOxlintConfigFile,
} from './build-from-oxlint-config/index.js';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import type { Linter } from 'eslint';
import {
  typescriptRulesExtendEslintRules,
  unicornRulesExtendEslintRules,
  viteTestCompatibleRules,
} from './constants.js';
import { typescriptTypeAwareRules } from '../scripts/constants.js';

describe('buildFromOxlintConfigFile', () => {
  it('successfully parse oxlint json config', () => {
    const configs = createConfigFileAndBuildFromIt(
      'success-config.json',
      `{
        "rules": {
          // hello world
          "no-await-in-loop": "error",
        },
      }`
    );

    expect(configs.length).toBeGreaterThanOrEqual(1);
    expect(configs[0].rules).not.toBeUndefined();
    expect('no-await-in-loop' in configs[0].rules!).toBe(true);
  });

  it('fails to find oxlint config', () => {
    const configs = buildFromOxlintConfigFile('not-found.json');

    expect(configs).toStrictEqual([]);
  });

  it('fails to parse invalid json', () => {
    const configs = createConfigFileAndBuildFromIt(
      'invalid-json.json',
      '["this", is an invalid json format]'
    );

    expect(configs).toStrictEqual([]);
  });

  it('fails to parse invalid oxlint config', () => {
    const configs = createConfigFileAndBuildFromIt(
      'invalid-config.json',
      JSON.stringify(['this is valid json but not an object'])
    );

    expect(configs).toStrictEqual([]);
  });
});

describe('integration test with oxlint', () => {
  for (const [index, config] of [
    // default
    {},
    // no plugins
    { plugins: [] },
    // simple plugin override
    { plugins: ['typescript'] },
    // custom rule off
    {
      rules: { eqeqeq: 'off' },
    },
    // combination plugin + rule
    { plugins: ['nextjs'], rules: { eqeqeq: 'off' } },

    // categories change
    { categories: { correctness: 'off', suspicious: 'warn' } },
    // combination plugin + categires + rules
    {
      plugins: ['nextjs'],
      categories: { correctness: 'off', style: 'warn' },
      rules: { eqeqeq: 'off' },
    },
    // all categories enabled
    {
      categories: {
        nursery: 'off', // we not support this category
        correctness: 'warn',
        pedantic: 'warn',
        perf: 'warn',
        restriction: 'warn',
        style: 'warn',
        suspicious: 'warn',
      },
    },
    // all plugins enabled
    {
      plugins: [
        'typescript',
        'unicorn',
        'react',
        'react-perf',
        'nextjs',
        'import',
        'jsdoc',
        'jsx-a11y',
        'node',
        'promise',
        'jest',
        'vitest',
        'vue',
      ],
    },
    // everything on
    {
      plugins: [
        'typescript',
        'unicorn',
        'react',
        'react-perf',
        'nextjs',
        'import',
        'jsdoc',
        'jsx-a11y',
        'node',
        'promise',
        'jest',
        'vitest',
        'vue',
      ],
      categories: {
        nursery: 'off', // we not support this category
        correctness: 'warn',
        pedantic: 'warn',
        perf: 'warn',
        restriction: 'warn',
        style: 'warn',
        suspicious: 'warn',
      },
    },
  ].entries()) {
    const fileContent = JSON.stringify(config);

    it(`should output same rule count for: ${fileContent}`, () => {
      const oxlintRulesCount = executeOxlintWithConfiguration(
        `integration-test-${index}-oxlint.json`,
        config
      );

      const configs = buildFromOxlintConfig(config);

      expect(configs.length).toBeGreaterThanOrEqual(1);
      expect(configs[0].rules).not.toBeUndefined();

      let expectedCount = oxlintRulesCount ?? 0;
      let receivedCount = 0;

      for (const buildConfig of configs) {
        receivedCount += Object.keys(buildConfig.rules!).length;

        // special mapping for ts alias rules
        if (
          config.plugins === undefined ||
          config.plugins.includes('typescript')
        ) {
          expectedCount += typescriptTypeAwareRules.filter(
            (tsRule) => `@typescript-eslint/${tsRule}` in buildConfig.rules!
          ).length;

          expectedCount += typescriptRulesExtendEslintRules.filter(
            (aliasRule) => aliasRule in buildConfig.rules!
          ).length;
        }

        // special case for vitest / jest alias rules
        if (config.plugins?.includes('vitest')) {
          expectedCount += viteTestCompatibleRules.filter(
            (aliasRule) => `vitest/${aliasRule}` in buildConfig.rules!
          ).length;
        }

        // special mapping for unicorn alias rules
        if (
          config.plugins === undefined ||
          config.plugins.includes('unicorn')
        ) {
          expectedCount += unicornRulesExtendEslintRules.filter(
            (aliasRule) => `unicorn/${aliasRule}` in buildConfig.rules!
          ).length;
        }
      }

      expect(receivedCount).toBe(expectedCount);
    });
  }
});

describe('nursery rules', () => {
  it('should not output nursery rules by default with buildFromOxlintConfig', () => {
    const config = {
      rules: {
        'import/named': 'error',
        'no-undef': 'error',
      },
    };

    const configs = buildFromOxlintConfig(config);

    expect(configs.length).toBeGreaterThanOrEqual(1);
    expect(configs[0].rules).not.toBeUndefined();

    // nursery rules should NOT be present
    expect('import/named' in configs[0].rules!).toBe(false);
    expect('no-undef' in configs[0].rules!).toBe(false);
  });

  it('should output nursery rules when withNursery option is true', () => {
    const config = {
      rules: {
        'import/named': 'error',
        'no-undef': 'error',
      },
    };

    const configs = buildFromOxlintConfig(config, { withNursery: true });

    expect(configs.length).toBeGreaterThanOrEqual(1);
    expect(configs[0].rules).not.toBeUndefined();

    // nursery rules SHOULD be present when withNursery is true
    expect('import/named' in configs[0].rules!).toBe(true);
    expect('no-undef' in configs[0].rules!).toBe(true);
    expect(configs[0].rules!['import/named']).toBe('off');
    expect(configs[0].rules!['no-undef']).toBe('off');
  });

  it('should not output nursery rules by default with buildFromOxlintConfigFile', () => {
    const configs = createConfigFileAndBuildFromIt(
      'nursery-default-config.json',
      JSON.stringify({
        rules: {
          'import/named': 'error',
          'no-undef': 'error',
        },
      })
    );

    expect(configs.length).toBeGreaterThanOrEqual(1);
    expect(configs[0].rules).not.toBeUndefined();

    // nursery rules should NOT be present by default
    expect('import/named' in configs[0].rules!).toBe(false);
    expect('no-undef' in configs[0].rules!).toBe(false);
  });

  it('should output nursery rules when withNursery option is true with buildFromOxlintConfigFile', () => {
    const filename = 'nursery-with-option-config.json';
    fs.writeFileSync(
      filename,
      JSON.stringify({
        rules: {
          'import/named': 'error',
          'no-undef': 'error',
        },
      })
    );

    const configs = buildFromOxlintConfigFile(filename, { withNursery: true });

    fs.unlinkSync(filename);

    expect(configs.length).toBeGreaterThanOrEqual(1);
    expect(configs[0].rules).not.toBeUndefined();

    // nursery rules SHOULD be present when withNursery is true
    expect('import/named' in configs[0].rules!).toBe(true);
    expect('no-undef' in configs[0].rules!).toBe(true);
    expect(configs[0].rules!['import/named']).toBe('off');
    expect(configs[0].rules!['no-undef']).toBe('off');
  });

  it('should not output nursery category by default', () => {
    const config = {
      categories: {
        nursery: 'warn',
      },
    };

    const configs = buildFromOxlintConfig(config);

    expect(configs.length).toBeGreaterThanOrEqual(1);
    expect(configs[0].rules).not.toBeUndefined();

    // No nursery rules should be present
    const hasNurseryRules = Object.keys(configs[0].rules!).some((rule) =>
      [
        'import/named',
        'no-undef',
        'constructor-super',
        'getter-return',
      ].includes(rule)
    );

    expect(hasNurseryRules).toBe(false);
  });

  it('should output nursery category when withNursery option is true', () => {
    const config = {
      categories: {
        nursery: 'warn',
      },
    };

    const configs = buildFromOxlintConfig(config, { withNursery: true });

    expect(configs.length).toBeGreaterThanOrEqual(1);
    expect(configs[0].rules).not.toBeUndefined();

    // Nursery rules should be present
    const hasNurseryRules = Object.keys(configs[0].rules!).some((rule) =>
      [
        'import/named',
        'no-undef',
        'constructor-super',
        'getter-return',
      ].includes(rule)
    );

    expect(hasNurseryRules).toBe(true);
  });
});

const createConfigFileAndBuildFromIt = (
  filename: string,
  content: string
): Linter.Config<Record<string, 'off'>>[] => {
  fs.writeFileSync(filename, content);

  const rules = buildFromOxlintConfigFile(filename);

  fs.unlinkSync(filename);

  return rules;
};

const executeOxlintWithConfiguration = (
  filename: string,
  config: {
    [key: string]: unknown;
    plugins?: string[];
    categories?: Record<string, unknown>;
    rules?: Record<string, unknown>;
  }
) => {
  fs.writeFileSync(filename, JSON.stringify(config));
  let oxlintOutput: string;

  const cliArguments = [
    `--config=${filename}`,
    '--disable-oxc-plugin',
    '--silent',
  ];

  try {
    oxlintOutput = execSync(`npx oxlint ${cliArguments.join(' ')}`, {
      encoding: 'utf8',
      stdio: 'pipe',
    });
  } catch {
    oxlintOutput = '';
  }

  fs.unlinkSync(filename);

  const result = /with\s(\d+)\srules/.exec(oxlintOutput);

  if (result === null) {
    return;
  }

  return Number.parseInt(result[1], 10) ?? undefined;
};

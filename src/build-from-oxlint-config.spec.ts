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
    { plugins: ['vite'], rules: { eqeqeq: 'off' } },

    // categories change
    { categories: { correctness: 'off', suspicious: 'warn' } },
    // combination plugin + categires + rules
    {
      plugins: ['vite'],
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
        'n',
        'promise',
        'jest',
        'vitest',
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
        'n',
        'promise',
        'jest',
        'vitest',
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

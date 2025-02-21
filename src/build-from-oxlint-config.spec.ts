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

describe('buildFromOxlintConfig', () => {
  it('skip deactivate categories', () => {
    expect(
      buildFromOxlintConfig({
        categories: {
          // correctness is the only category on by default
          correctness: 'off',
        },
      })
    ).toStrictEqual([
      {
        name: 'oxlint/from-oxlint-config',
        rules: {},
      },
    ]);
  });

  it('default plugins (react, unicorn, typescript), default categories', () => {
    // snapshot because it can change with the next release
    expect(buildFromOxlintConfig({})).toMatchSnapshot(
      'defaultPluginDefaultCategories'
    );
  });

  it('custom plugins, default categories', () => {
    // snapshot because it can change with the next release
    expect(
      buildFromOxlintConfig({
        plugins: ['unicorn'],
      })
    ).toMatchSnapshot('customPluginDefaultCategories');
  });

  it('custom plugins, custom categories', () => {
    // snapshot because it can change with the next release
    expect(
      buildFromOxlintConfig({
        plugins: ['import'],
        categories: {
          suspicious: 'warn',
          correctness: 'off',
        },
      })
    ).toMatchSnapshot('customPluginCustomCategories');
  });

  it('skip deactivate rules, for custom enable category', () => {
    const configs = buildFromOxlintConfig({
      plugins: ['import'],
      categories: {
        suspicious: 'warn',
        correctness: 'off',
      },
      rules: {
        'import/no-self-import': 'off',
      },
    });

    expect(configs.length).toBe(1);
    expect(configs[0].rules).not.toBeUndefined();
    expect('import/no-self-import' in configs[0].rules!).toBe(false);
  });

  describe('ignorePattern Property', () => {
    it('should append ignorePatterns to eslint v9 ignore property', () => {
      const configs = buildFromOxlintConfig({
        ignorePatterns: ['./tests/.*ts'],
      });

      expect(configs.length).toBe(1);
      expect(configs[0].ignores).toStrictEqual(['./tests/.*ts']);
    });
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

    expect(configs.length).toBe(1);
    expect(configs[0].rules).not.toBeUndefined();
    expect('no-await-in-loop' in configs[0].rules!).toBe(true);
  });

  it('fails to find oxlint config', () => {
    const configs = buildFromOxlintConfigFile('not-found.json');

    expect(configs).toStrictEqual([
      {
        name: 'oxlint/from-oxlint-config',
      },
    ]);
  });

  it('fails to parse invalid json', () => {
    const configs = createConfigFileAndBuildFromIt(
      'invalid-json.json',
      '["this", is an invalid json format]'
    );

    expect(configs).toStrictEqual([
      {
        name: 'oxlint/from-oxlint-config',
      },
    ]);
  });

  it('fails to parse invalid oxlint config', () => {
    const configs = createConfigFileAndBuildFromIt(
      'invalid-config.json',
      JSON.stringify(['this is valid json but not an object'])
    );

    expect(configs).toStrictEqual([
      {
        name: 'oxlint/from-oxlint-config',
      },
    ]);
  });
});

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

      expect(configs.length).toBe(1);
      expect(configs[0].rules).not.toBeUndefined();

      let expectedCount = oxlintRulesCount ?? 0;

      // special mapping for ts alias rules
      if (
        config.plugins === undefined ||
        config.plugins.includes('typescript')
      ) {
        expectedCount += typescriptRulesExtendEslintRules.filter(
          (aliasRule) => aliasRule in configs[0].rules!
        ).length;
      }

      // special case for vitest / jest alias rules
      if (config.plugins?.includes('vitest')) {
        expectedCount += viteTestCompatibleRules.filter(
          (aliasRule) => `vitest/${aliasRule}` in configs[0].rules!
        ).length;
      }

      // special mapping for unicorn alias rules
      if (config.plugins === undefined || config.plugins.includes('unicorn')) {
        expectedCount += unicornRulesExtendEslintRules.filter(
          (aliasRule) => `unicorn/${aliasRule}` in configs[0].rules!
        ).length;
      }

      expect(Object.keys(configs[0].rules!).length).toBe(expectedCount);
    });
  }
});

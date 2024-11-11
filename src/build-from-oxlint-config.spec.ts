import { describe, expect, it } from 'vitest';
import {
  buildFromOxlintConfig,
  buildFromOxlintConfigFile,
} from './build-from-oxlint-config.js';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import type { Linter } from 'eslint';
import { typescriptRulesExtendEslintRules } from './constants.js';

describe('buildFromOxlintConfig', () => {
  describe('rule values', () => {
    for (const ruleSetting of [
      'error',
      ['error'],
      'warn',
      ['warn'],
      1,
      [1],
      2,
      [2],
    ]) {
      it(`detect active rule ${JSON.stringify(ruleSetting)} inside "rules" scope`, () => {
        const configs = buildFromOxlintConfig({
          rules: {
            eqeqeq: ruleSetting,
          },
        });

        expect(configs.length).toBe(1);
        expect(configs[0].rules).not.toBeUndefined();
        expect('eqeqeq' in configs[0].rules!).toBe(true);
        expect(configs[0].rules!.eqeqeq).toBe('off');
      });
    }

    for (const ruleSetting of ['off', ['off'], 0, [0]]) {
      it(`skip deactive rule ${JSON.stringify(ruleSetting)} inside "rules" scope`, () => {
        const configs = buildFromOxlintConfig({
          rules: {
            eqeqeq: ruleSetting,
          },
        });

        expect(configs.length).toBe(1);
        expect(configs[0].rules).not.toBeUndefined();
        expect('eqeqeq' in configs[0].rules!).toBe(false);
      });
    }

    for (const ruleSetting of ['on', ['on'], 3, [3]]) {
      it(`skip invalid ${JSON.stringify(ruleSetting)} inside "rules" scope`, () => {
        const configs = buildFromOxlintConfig({
          rules: {
            eqeqeq: ruleSetting,
          },
        });

        expect(configs.length).toBe(1);
        expect(configs[0].rules).not.toBeUndefined();
        expect('eqeqeq' in configs[0].rules!).toBe(false);
      });
    }
  });

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
          nursery: 'warn',
          correctness: 'off',
        },
      })
    ).toMatchSnapshot('customPluginCustomCategories');
  });

  it('skip deactivate rules, for custom enable category', () => {
    const configs = buildFromOxlintConfig({
      plugins: ['import'],
      categories: {
        nursery: 'warn',
        correctness: 'off',
      },
      rules: {
        'import/no-unused-modules': 'off',
      },
    });

    expect(configs.length).toBe(1);
    expect(configs[0].rules).not.toBeUndefined();
    expect('import/no-unused-modules' in configs[0].rules!).toBe(false);
  });

  // look here: <https://github.com/oxc-project/oxc/blob/0b329516372a0353e9eb18e5bc0fbe63bce21fee/crates/oxc_linter/src/config/rules.rs#L285>
  it('detects oxlint rules with plugin alias inside rules block', () => {
    const configs = buildFromOxlintConfig({
      rules: {
        'eslint/eqeqeq': 'warn',
        'typescript/no-unused-vars': 'warn',
        'react_perf/jsx-no-new-array-as-prop': 'warn',
        'nextjs/no-img-element': 'warn',
        'jsx_a11y/alt-text': 'warn',
        'react/rules-of-hooks': 'warn',
        // 'deepscan/xxx': 'warn',
      },
    });

    expect(configs.length).toBe(1);
    expect(configs[0].rules).not.toBeUndefined();
    expect('eqeqeq' in configs[0].rules!).toBe(true);
    expect('@typescript-eslint/no-unused-vars' in configs[0].rules!).toBe(true);
    expect('react-perf/jsx-no-new-array-as-prop' in configs[0].rules!).toBe(
      true
    );
    expect('@next/next/no-img-element' in configs[0].rules!).toBe(true);
    expect('jsx-a11y/alt-text' in configs[0].rules!).toBe(true);
    expect('react-hooks/rules-of-hooks' in configs[0].rules!).toBe(true);
  });

  it('detects rules without plugin name', () => {
    const configs = buildFromOxlintConfig({
      rules: {
        'no-unused-vars': 'warn',
        'jsx-no-new-array-as-prop': 'warn',
        'no-img-element': 'warn',
        'no-array-reduce': 'warn',
      },
    });

    expect(configs.length).toBe(1);
    expect(configs[0].rules).not.toBeUndefined();
    expect('@typescript-eslint/no-unused-vars' in configs[0].rules!).toBe(true);
    expect('react-perf/jsx-no-new-array-as-prop' in configs[0].rules!).toBe(
      true
    );
    expect('@next/next/no-img-element' in configs[0].rules!).toBe(true);
    expect('unicorn/no-array-reduce' in configs[0].rules!).toBe(true);
  });

  it('skips unknown oxlint rules', () => {
    const configs = buildFromOxlintConfig({
      rules: {
        unknown: 'warn',
        'typescript/no-img-element': 'warn', // valid rule, but wrong plugin-name
      },
    });

    expect(configs.length).toBe(1);
    expect(configs[0].rules).not.toBeUndefined();
    expect('unknown' in configs[0].rules!).toBe(false);
    expect('@next/next/no-img-element' in configs[0].rules!).toBe(false);
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

  // --disabled-<foo>-plugin can be removed after oxc-project/oxc#6896
  if (config.plugins !== undefined) {
    for (const plugin of ['typescript', 'unicorn', 'react']) {
      if (!config.plugins!.includes(plugin)) {
        cliArguments.push(`--disable-${plugin}-plugin`);
      }
    }
  }

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
    { categories: { correctness: 'off', nusery: 'warn' } },
    // combination plugin + categires + rules
    {
      plugins: ['vite'],
      categories: { correctness: 'off', style: 'warn' },
      rules: { eqeqeq: 'off' },
    },
    // all categories enabled
    {
      categories: {
        correctness: 'warn',
        nursery: 'off', // enable after oxc-project/oxc#7073
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
        'tree_shaking',
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
        'tree_shaking',
      ],
      categories: {
        correctness: 'warn',
        nursery: 'off', // enable after oxc-project/oxc#7073
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

      expect(Object.keys(configs[0].rules!).length).toBe(expectedCount);
    });
  }
});

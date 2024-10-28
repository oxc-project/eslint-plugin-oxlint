import { describe, expect, it } from 'vitest';
import {
  buildFromOxlintConfig,
  buildFromOxlintConfigFile,
} from './build-from-oxlint-config.js';
import fs from 'node:fs';
import { execSync } from 'node:child_process';

describe('buildFromOxlintConfig', () => {
  describe('rules values', () => {
    it('detect active rules inside "rules" scope', () => {
      ['error', ['error'], 'warn', ['warn'], 1, [1], 2, [2]].forEach(
        (ruleSetting) => {
          const rules = buildFromOxlintConfig({
            rules: {
              eqeqeq: ruleSetting,
            },
          });

          expect('eqeqeq' in rules).toBe(true);
          expect(rules.eqeqeq).toBe('off');
        }
      );
    });

    it('skip deactive rules inside "rules" scope', () => {
      ['off', ['off'], 0, [0]].forEach((ruleSetting) => {
        const rules = buildFromOxlintConfig({
          rules: {
            eqeqeq: ruleSetting,
          },
        });

        expect('eqeqeq' in rules).toBe(false);
      });
    });

    it('skip invalid rules inside "rules" scope', () => {
      ['on', ['on'], 3, [3]].forEach((ruleSetting) => {
        const rules = buildFromOxlintConfig({
          rules: {
            eqeqeq: ruleSetting,
          },
        });

        expect('eqeqeq' in rules).toBe(false);
      });
    });
  });

  it('skip deactive categories', () => {
    expect(
      buildFromOxlintConfig({
        categories: {
          // correctness is the only category on by default
          correctness: 'off',
        },
      })
    ).toStrictEqual({});
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

  it('skip deactive rules, for custom enable category', () => {
    const rules = buildFromOxlintConfig({
      plugins: ['import'],
      categories: {
        nursery: 'warn',
        correctness: 'off',
      },
      rules: {
        'import/no-unused-modules': 'off',
      },
    });
    expect('import/no-unused-modules' in rules).toBe(false);
  });
});

const createConfigFileAndBuildFromIt = (
  filename: string,
  content: string
): Record<string, unknown> => {
  fs.writeFileSync(filename, content);

  const rules = buildFromOxlintConfigFile(filename);

  fs.unlinkSync(filename);

  return rules;
};

describe('buildFromOxlintConfigFile', () => {
  it('successfully parse oxlint config', () => {
    const rules = createConfigFileAndBuildFromIt(
      'success-config.json',
      JSON.stringify({
        rules: {
          'no-await-loop': 'error',
        },
      })
    );

    expect('no-await-loop' in rules).toBe(true);
  });

  it('fails to find oxlint config', () => {
    const rules = buildFromOxlintConfigFile('not-found.json');

    expect(rules).toStrictEqual({});
  });

  it('fails to parse invalid json', () => {
    const rules = createConfigFileAndBuildFromIt(
      'invalid-json.json',
      '["this", is an invalid json format]'
    );

    expect(rules).toStrictEqual({});
  });

  it('fails to parse invalid oxlint config', () => {
    const rules = createConfigFileAndBuildFromIt(
      'invalid-config.json',
      JSON.stringify(['this is valid json but not an object'])
    );

    expect(rules).toStrictEqual({});
  });
});

const executeOxlintWithConfiguration = (filename: string, content: string) => {
  fs.writeFileSync(filename, content);
  let oxlintOutput: string;

  try {
    // --disabled-<foo>-plugin can be disabled after oxc-project/oxc#6896
    oxlintOutput = execSync(
      `npx oxlint -c ${filename} --disable-oxc-plugin --disable-typescript-plugin --disable-unicorn-plugin --disable-react-plugin`,
      {
        encoding: 'utf-8',
      }
    );
  } catch {
    oxlintOutput = '';
  }

  fs.unlinkSync(filename);

  const result = /with\s(\d+)\srules/.exec(oxlintOutput);

  if (result === null) {
    return undefined;
  }

  return parseInt(result[1], 10) ?? undefined;
};

describe('integration test with oxlint', () => {
  [
    // default
    // {}, can be enabled after oxc-project/oxc#6896
    // no plugins
    { plugins: [] },
    // simple plugin override
    { plugins: ['vite'] },
    // custom rule off
    {
      plugins: [] /** can be removed after oxc-project/oxc#6896 */,
      rules: { eqeqeq: 'off' },
    },
    // combination plugin + rule
    { plugins: ['vite'], rules: { eqeqeq: 'off' } },
    // combination plugin + categires + rules
    {
      plugins: ['vite'],
      categories: { correctness: 'off', style: 'warn' },
      rules: { eqeqeq: 'off' },
    },
    // all categories enabled
    {
      plugins: [] /** can be removed after oxc-project/oxc#6896 */,
      categories: {
        correctness: 'warn',
        nursery: 'warn',
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
        // can be removed after oxc-project/oxc#6896
        // 'typescript',
        // 'unicorn',
        // 'react',
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
  ].forEach((json, index) => {
    const fileContent = JSON.stringify(json);

    it(`should output same rule count for: ${fileContent}`, () => {
      const oxlintRulesCount = executeOxlintWithConfiguration(
        `integration-test-${index}-oxlint.json`,
        fileContent
      );

      const eslintRules = createConfigFileAndBuildFromIt(
        `integration-test-${index}-eslint.json`,
        fileContent
      );

      expect(Object.keys(eslintRules).length).toBe(oxlintRulesCount);
    });
  });
});

import { expect, it } from 'vitest';
import { buildFromObject } from './build-from-oxlint-config.js';

it('detect active rules inside "rules" scope', () => {
  ['error', ['error'], 'warn', ['warn'], 1, [1], 2, [2]].forEach(
    (ruleSetting) => {
      expect(
        buildFromObject({
          plugins: [],
          rules: {
            eqeqeq: ruleSetting,
          },
        })
      ).toStrictEqual({
        eqeqeq: 'off',
      });
    }
  );
});

it('skip deactive rules inside "rules" scope', () => {
  ['off', ['off'], 0, [0]].forEach((ruleSetting) => {
    expect(
      buildFromObject({
        plugins: [],
        rules: {
          eqeqeq: ruleSetting,
        },
      })
    ).toStrictEqual({});
  });
});

it('skip deactive categories', () => {
  expect(
    buildFromObject({
      categories: {
        correctness: 'off',
      },
    })
  ).toStrictEqual({});
});

it('default plugins (react, unicorn, typescript), default categories', () => {
  // snapshot because it can change with the next release
  expect(buildFromObject({})).toMatchSnapshot('defaultPluginDefaultCategories');
});

it('custom plugins, default categories', () => {
  // snapshot because it can change with the next release
  expect(
    buildFromObject({
      plugins: ['unicorn'],
    })
  ).toMatchSnapshot('customPluginDefaultCategories');
});

it('custom plugins, custom categories', () => {
  // snapshot because it can change with the next release
  expect(
    buildFromObject({
      plugins: ['eslint'],
      categories: {
        perf: 'warn',
        correctness: 'off',
      },
    })
  ).toMatchSnapshot('customPluginCustomCategories');
});

it('skip deactive rules, for custom enable category', () => {
  const rules = buildFromObject({
    plugins: ['eslint'],
    categories: {
      perf: 'warn',
      correctness: 'off',
    },
    rules: {
      'no-await-in-loop': 'off',
    },
  });
  expect('no-await-in-loop' in rules).toBe(false);
});

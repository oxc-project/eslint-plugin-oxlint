import { expect, it } from 'vitest';
import { buildFromObject } from './build-from-oxlint-config.js';

it('detect active rules inside "rules" scope', () => {
  ['error', ['error']].forEach((ruleSetting) => {
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
  });
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

it('skip deactive categories ', () => {
  const rules = buildFromObject({
    categories: {
      correctness: 'off',
    },
  });

  expect(rules).toStrictEqual({});
});

it('default plugins (react, unicorn, typescript), default categories', () => {
  const rules = buildFromObject({});

  // snapshot because it can change with the next release
  expect(rules).toMatchSnapshot('defaultPluginDefaultCategories');
});

it('custom plugins, default categories', () => {
  const rules = buildFromObject({
    plugins: ['unicorn'],
  });

  // snapshot because it can change with the next release
  expect(rules).toMatchSnapshot('customPluginDefaultCategories');
});

it('custom plugins, custom categories', () => {
  const rules = buildFromObject({
    plugins: ['eslint'],
    categories: {
      correctness: 'warn',
    },
    rules: {
      'no-invalid-regexp': 'off',
    },
  });

  expect('no-invalid-regexp' in rules).toBe(false);
});

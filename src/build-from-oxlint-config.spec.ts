import { expect, it } from 'vitest';
import { buildFromObject } from './build-from-oxlint-config.js';

it('detect active rules inside "rules" scope', () => {
  const rules = buildFromObject({
    plugins: [],
    rules: {
      eqeqeq: 'error',
    },
  });

  expect(rules).toStrictEqual({
    eqeqeq: 'off',
  });
});

it('skip deactive rules inside "rules" scope', () => {
  const rules = buildFromObject({
    plugins: [],
    rules: {
      eqeqeq: 'off',
    },
  });

  expect(rules).toStrictEqual({});
});

it('detects active categories and append its rules', () => {
  const rules = buildFromObject({
    plugins: [],
    categories: {
      correctness: 'error',
    },
  });

  // snapshot because it can change with the next release
  expect(rules).toMatchSnapshot('simpleCategoryActive');
});

it('skip deactive categories ', () => {
  const rules = buildFromObject({
    plugins: [],
    categories: {
      correctness: 'off',
    },
  });

  expect(rules).toStrictEqual({});
});

it('enables default plugin rules (react, unicorn, typescript)', () => {
  const rules = buildFromObject({});

  // snapshot because it can change with the next release
  expect(rules).toMatchSnapshot('defaultPluginRules');
});

it('detects plugin and append its rules', () => {
  const rules = buildFromObject({
    plugins: ['unicorn'],
  });

  // snapshot because it can change with the next release
  expect(rules).toMatchSnapshot('detectPluginRules');
});

it('detects manually disabled rules, which are extended by category', () => {
  const rules = buildFromObject({
    plugins: ['eslint'],
    rules: {
      'no-invalid-regexp': 'off',
    },
  });

  expect('no-invalid-regexp' in rules).toBe(false);
});

it('detects manually disabled rules, which are extended by plugin', () => {
  const rules = buildFromObject({
    categories: {
      correctness: 'error',
    },
    rules: {
      'no-invalid-regexp': 'off',
    },
  });

  expect('no-invalid-regexp' in rules).toBe(false);
});

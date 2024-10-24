import { expect, it } from 'vitest';
import buildFromOxlintConfig from './build-from-oxlint-config.js';
import configByScope from './configs-by-scope.js';
import path from 'node:path';

const defaultPluginRules = {
  ...configByScope['flat/react'].rules,
  ...configByScope['flat/unicorn'].rules,
  ...configByScope['flat/typescript'].rules,
};

it('detect active rules inside "rules" scope', () => {
  const rules = buildFromOxlintConfig(
    path.resolve(
      import.meta.dirname,
      '__mocks__',
      'oxlint-simple-rule-active.json'
    )
  );

  expect(rules).toStrictEqual({
    ...defaultPluginRules,
    eqeqeq: 'off',
  });
});

it('skip deactive rules inside "rules" scope', () => {
  const rules = buildFromOxlintConfig(
    path.resolve(
      import.meta.dirname,
      '__mocks__',
      'oxlint-simple-rule-deactive.json'
    )
  );

  expect(rules).toStrictEqual(defaultPluginRules);
});

it('detects active categories and append its rules', () => {
  const rules = buildFromOxlintConfig(
    path.resolve(
      import.meta.dirname,
      '__mocks__',
      'oxlint-simple-category-active.json'
    )
  );

  // snapshot because it can change with the next release
  expect(rules).toMatchSnapshot('simpleCategoryActive');
});

it('skip deactive categories ', () => {
  const rules = buildFromOxlintConfig(
    path.resolve(
      import.meta.dirname,
      '__mocks__',
      'oxlint-simple-category-deactive.json'
    )
  );

  expect(rules).toStrictEqual(defaultPluginRules);
});

it('enables default plugin rules (react, unicorn, typescript)', () => {
  const rules = buildFromOxlintConfig(
    path.resolve(
      import.meta.dirname,
      '__mocks__',
      'oxlint-simple-plugin-default.json'
    )
  );

  // snapshot because it can change with the next release
  expect(rules).toMatchSnapshot('defaultPluginRules');
});

it('detects plugin and append its rules', () => {
  const rules = buildFromOxlintConfig(
    path.resolve(import.meta.dirname, '__mocks__', 'oxlint-simple-plugin.json')
  );

  // snapshot because it can change with the next release
  expect(rules).toMatchSnapshot('detectPluginRules');
});

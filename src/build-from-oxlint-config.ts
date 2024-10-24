import fs from 'node:fs';
import configByCategory from './configs-by-category.js';
import configByScope from './configs-by-scope.js';

const getConfigContent = (
  oxlintConfigFile: string
): Record<string, unknown> => {
  try {
    const buffer = fs.readFileSync(oxlintConfigFile, 'utf8');

    try {
      const configContent = JSON.parse(buffer);

      return configContent;
    } catch {
      console.error(
        `eslint-plugin-oxlint: could not parse oxlint config file: ${oxlintConfigFile}`
      );
      return {};
    }
  } catch {
    console.error(
      `eslint-plugin-oxlint: could not find oxlint config file: ${oxlintConfigFile}`
    );
    return {};
  }
};

const appendCategoriesScope = (
  categories: Record<string, unknown>,
  rules: Record<string, 'off'>
): void => {
  for (const category in categories) {
    const configName = `flat/${category}`;

    if (categories[category] !== 'off' && configName in configByCategory) {
      // @ts-ignore -- come on TS, we are checking if the configName exists in the configByCategory
      Object.assign(rules, configByCategory[configName].rules);
    }
  }
};

const appendPluginsScope = (
  plugins: string[],
  rules: Record<string, 'off'>
): void => {
  for (const plugin of plugins) {
    const configName = `flat/${plugin}`;

    if (configName in configByScope) {
      // @ts-ignore -- come on TS, we are checking if the configName exists in the configByCategory
      Object.assign(rules, configByScope[configName].rules);
    }
  }
};

const appendRulesScope = (
  oxlintRules: Record<string, unknown>,
  rules: Record<string, 'off'>
): void => {
  for (const rule in oxlintRules) {
    // is this rules not turned off
    if (oxlintRules[rule] !== 'off') {
      rules[rule] = 'off';
    } else {
      // rules extended by categories or plugins can be disabled manually
      delete rules[rule];
    }
  }
};

export const buildFromObject = (
  config: Record<string, unknown>
): Record<string, 'off'> => {
  const rules: Record<string, 'off'> = {};

  if (
    'categories' in config &&
    typeof config.categories === 'object' &&
    config.categories !== null
  ) {
    appendCategoriesScope(config.categories as Record<string, unknown>, rules);
  }

  if ('plugins' in config && Array.isArray(config.plugins)) {
    appendPluginsScope(config.plugins as string[], rules);
  } else {
    // default values, see <https://oxc.rs/docs/guide/usage/linter/config#plugins>
    // oxc is in ignoreScope
    appendPluginsScope(['react', 'unicorn', 'typescript'], rules);
  }

  // is there a rules objects in the json file
  if (
    'rules' in config &&
    typeof config.rules === 'object' &&
    config.rules !== null
  ) {
    appendRulesScope(config.rules as Record<string, unknown>, rules);
  }

  return rules;
};

export default function buildFromOxlintConfigFile(
  oxlintConfigFile: string
): Record<string, 'off'> {
  const config = getConfigContent(oxlintConfigFile);

  return buildFromObject(config);
}

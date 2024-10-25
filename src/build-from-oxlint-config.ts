import fs from 'node:fs';
import configByCategory from './configs-by-category.js';
import { scopeMaps } from '../scripts/constants.js';

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
  plugins: string[],
  categories: Record<string, unknown>,
  rules: Record<string, 'off'>
): void => {
  for (const category in categories) {
    const configName = `flat/${category}`;

    // category is enabled and valid
    if (categories[category] !== 'off' && configName in configByCategory) {
      // @ts-ignore -- come on TS, we are checking if the configName exists in the configByCategory
      const possibleRules = configByCategory[configName].rules;

      // iterate to each rule to check if the rule can be appended, because the plugin is activated
      Object.keys(possibleRules).forEach((rule) => {
        plugins.forEach((plugin) => {
          // @ts-ignore -- come on TS, we are checking if the plugin exists in the configByscopeMapsCategory
          const rulePrefix = plugin in scopeMaps ? scopeMaps[plugin] : plugin;

          // the rule has no prefix, so it is a eslint one

          if (rulePrefix === '' && !rule.includes('/')) {
            rules[rule] = 'off';
            // other rules with a prefix like @typescript-eslint/
          } else if (rule.startsWith(`${rulePrefix}/`)) {
            rules[rule] = 'off';
          }
        });
      });
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

const readPluginsFromConfig = (config: Record<string, unknown>): string[] => {
  return 'plugins' in config && Array.isArray(config.plugins)
    ? (config.plugins as string[])
    : // default values, see <https://oxc.rs/docs/guide/usage/linter/config#plugins>
      ['react', 'unicorn', 'typescript'];
};

export const buildFromObject = (
  config: Record<string, unknown>
): Record<string, 'off'> => {
  const rules: Record<string, 'off'> = {};
  const plugins = readPluginsFromConfig(config);

  if (
    'categories' in config &&
    typeof config.categories === 'object' &&
    config.categories !== null
  ) {
    appendCategoriesScope(
      plugins,
      config.categories as Record<string, unknown>,
      rules
    );
  } else {
    // default values, see <https://github.com/oxc-project/oxc/blob/0acca58/crates/oxc_linter/src/builder.rs#L82>
    appendCategoriesScope(plugins, { correctness: 'warn' }, rules);
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

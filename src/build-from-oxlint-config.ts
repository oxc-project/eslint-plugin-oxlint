import fs from 'node:fs';
import configByCategory from './configs-by-category.js';

// these are the mappings from the scope in the rules.rs to the eslint scope
// only used for the scopes where the directory structure doesn't reflect the eslint scope
// such as `typescript` vs `@typescript-eslint` or others. Eslint as a scope is an exception,
// as eslint doesn't have a scope.
// There is a duplicate in scripts/constants.js, for clean builds we manage it in 2 files.
// In the future we can generate maybe this constant into src folder
const scopeMaps = {
  eslint: '',
  typescript: '@typescript-eslint',
};

const getConfigContent = (
  oxlintConfigFile: string
): Record<string, unknown> | undefined => {
  try {
    const buffer = fs.readFileSync(oxlintConfigFile, 'utf8');

    try {
      const configContent = JSON.parse(buffer);

      if (typeof configContent !== 'object') {
        throw new Error('not an valid config file');
      }

      return configContent;
    } catch {
      console.error(
        `eslint-plugin-oxlint: could not parse oxlint config file: ${oxlintConfigFile}`
      );
      return undefined;
    }
  } catch {
    console.error(
      `eslint-plugin-oxlint: could not find oxlint config file: ${oxlintConfigFile}`
    );
    return undefined;
  }
};

const appendCategoriesScope = (
  plugins: string[],
  categories: Record<string, unknown>,
  rules: Record<string, 'off'>
): void => {
  for (const category in categories) {
    const configName = `flat/${category}`;

    // category is not enabled or not in found categories
    if (categories[category] === 'off' || !(configName in configByCategory)) {
      continue;
    }

    // @ts-ignore -- come on TS, we are checking if the configName exists in the configByCategory
    const possibleRules = configByCategory[configName].rules;

    // iterate to each rule to check if the rule can be appended, because the plugin is activated
    Object.keys(possibleRules).forEach((rule) => {
      plugins.forEach((plugin) => {
        // @ts-ignore -- come on TS, we are checking if the plugin exists in the configByscopeMapsCategory
        const pluginPrefix = plugin in scopeMaps ? scopeMaps[plugin] : plugin;

        // the rule has no prefix, so it is a eslint one
        if (pluginPrefix === '' && !rule.includes('/')) {
          rules[rule] = 'off';
          // other rules with a prefix like @typescript-eslint/
        } else if (rule.startsWith(`${pluginPrefix}/`)) {
          rules[rule] = 'off';
        }
      });
    });
  }
};

const appendRulesScope = (
  oxlintRules: Record<string, unknown>,
  rules: Record<string, 'off'>
): void => {
  for (const rule in oxlintRules) {
    // is this rules not turned off
    if (!isDeactiveValue(oxlintRules[rule])) {
      rules[rule] = 'off';
    } else if (rule in rules) {
      // rules extended by categories or plugins can be disabled manually
      delete rules[rule];
    }
  }
};

const isDeactiveValue = (value: unknown): boolean => {
  const isOff = (value: unknown) => value === 'off' || value === 0;

  return isOff(value) || (Array.isArray(value) && isOff(value[0]));
};

const readPluginsFromConfig = (config: Record<string, unknown>): string[] => {
  return 'plugins' in config && Array.isArray(config.plugins)
    ? (config.plugins as string[])
    : // default values, see <https://oxc.rs/docs/guide/usage/linter/config#plugins>
      ['react', 'unicorn', 'typescript'];
};

export const buildFromOxlintConfig = (
  config: Record<string, unknown>
): Record<string, 'off'> => {
  const rules: Record<string, 'off'> = {};
  const plugins = readPluginsFromConfig(config);

  // it is not a plugin but it is activated by default
  plugins.push('eslint');

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

export const buildFromOxlintConfigFile = (
  oxlintConfigFile: string
): Record<string, 'off'> => {
  const config = getConfigContent(oxlintConfigFile);

  // we could not parse form the file, do not build with default values
  // we can not be sure if the setup is right
  if (config === undefined) {
    return {};
  }

  return buildFromOxlintConfig(config);
};

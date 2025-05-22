import fs from 'node:fs';
import type {
  OxlintConfig,
  OxlintConfigOverride,
  OxlintConfigPlugins,
  OxlintConfigRules,
} from './types.js';
import { getConfigContent } from './utilities.js';
import { defaultPlugins, readPluginsFromConfig } from './plugins.js';
import { readRulesFromConfig } from './rules.js';
import { readOverridesFromConfig } from './overrides.js';

/**
 * Checks if the given path is a file.
 *
 * @param path - The path to check.
 * @returns `true` if the path is a file, `false` otherwise.
 */
const isFile = (path: string) => {
  try {
    return fs.statSync(path).isFile();
  } catch {
    return false;
  }
};

/**
 * Appends plugins, rules and overrides from the extends configs files to the given config.
 */
export const handleExtendsScope = (
  extendsConfigs: OxlintConfig[],
  config: OxlintConfig
) => {
  let rules: OxlintConfigRules = readRulesFromConfig(config) ?? {};
  const plugins: OxlintConfigPlugins = readPluginsFromConfig(config) ?? [];
  const overrides: OxlintConfigOverride[] =
    readOverridesFromConfig(config) ?? [];
  for (const extendConfig of extendsConfigs) {
    plugins.unshift(...(readPluginsFromConfig(extendConfig) ?? defaultPlugins));
    rules = { ...readRulesFromConfig(extendConfig), ...rules };
    overrides.unshift(...(readOverridesFromConfig(extendConfig) ?? []));
  }
  if (plugins.length > 0) config.plugins = [...new Set(plugins)];
  if (Object.keys(rules).length > 0) config.rules = rules;
  if (overrides.length > 0) config.overrides = overrides;
};

/**
 * tries to return the content of the chain "extends" section from the config.
 * it returns `undefined` when not found or invalid and ignores non file paths.
 */
export const readExtendsConfigsFromConfig = (
  config: OxlintConfig
): OxlintConfig[] | undefined => {
  if (!('extends' in config) || !Array.isArray(config.extends)) {
    return undefined;
  }
  const extendsConfigs: OxlintConfig[] = [];
  for (const file of config.extends) {
    if (!isFile(file)) continue; // ignore non file paths
    const extendConfig = getConfigContent(file);
    if (!extendConfig) continue;
    extendsConfigs.push(
      extendConfig,
      ...(readExtendsConfigsFromConfig(extendConfig) ?? [])
    );
  }
  return extendsConfigs;
};

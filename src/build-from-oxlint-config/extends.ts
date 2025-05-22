import fs from 'node:fs';
import path from 'node:path';
import type {
  OxlintConfig,
  OxlintConfigOverride,
  OxlintConfigPlugins,
  OxlintConfigRules,
  OxlintExtendsConfigs,
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
 * tries to return the "extends" section from the config.
 * it returns `undefined` when not found or invalid.
 */
const readExtendsFromConfig = (
  config: OxlintConfig
): OxlintExtendsConfigs | undefined => {
  return 'extends' in config && Array.isArray(config.extends)
    ? (config.extends as OxlintExtendsConfigs)
    : undefined;
};

/**
 * Resolves the paths of the "extends" section relative to the given config file.
 */
export const resolveRelativeExtendsPaths = (
  config: OxlintConfig,
  configFile: string
) => {
  const extendsFiles = readExtendsFromConfig(config);
  if (!extendsFiles || extendsFiles.length === 0) return;
  const configFileDirectory = path.dirname(path.resolve(configFile));
  config.extends = extendsFiles.map((extendFile) => {
    if (isFile(extendFile)) {
      return path.resolve(configFileDirectory, extendFile);
    }
    return extendFile;
  });
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
  const extendsFiles = readExtendsFromConfig(config);
  if (!extendsFiles || extendsFiles.length === 0) return undefined;
  const extendsConfigs: OxlintConfig[] = [];
  for (const file of extendsFiles) {
    if (!isFile(file)) continue; // ignore non file paths
    const extendConfig = getConfigContent(file);
    if (!extendConfig) continue;
    resolveRelativeExtendsPaths(extendConfig, file);
    extendsConfigs.push(
      extendConfig,
      ...(readExtendsConfigsFromConfig(extendConfig) ?? [])
    );
  }
  return extendsConfigs;
};

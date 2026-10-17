import path from 'node:path';
import {
  oxlintConfigMeta,
  type OxlintConfig,
  type OxlintConfigOverride,
  type OxlintConfigPlugins,
  type OxlintConfigRules,
  type OxlintConfigExtends,
} from './types.js';
import { getJsoncContent } from './loader.js';
import { defaultPlugins, readPluginsFromConfig } from './plugins.js';
import { readRulesFromConfig } from './rules.js';
import { readOverridesFromConfig } from './overrides.js';

/**
 * tries to return the "extends" section from the config.
 * it returns `undefined` when not found or invalid.
 */
const readExtendsFromConfig = (
  config: Record<string, unknown>
): OxlintConfigExtends | undefined => {
  return 'extends' in config && Array.isArray(config.extends) ? config.extends : undefined;
};

/**
 * Resolves the paths of the "extends" section relative to the given config file.
 */
export const resolveRelativeExtendsPaths = (config: OxlintConfig) => {
  if (!config[oxlintConfigMeta]?.filePath) {
    return;
  }

  const extendsFiles = readExtendsFromConfig(config);
  if (!extendsFiles?.length) return;
  const configFileDirectory = path.dirname(config[oxlintConfigMeta].filePath);
  // The "extends" array cannot mix strings and OxlintConfig objects.
  // string is only allowed in json config files
  // objects are only allowed in js/ts config files
  config.extends = extendsFiles.map((extendFile) => {
    if (typeof extendFile === 'string') {
      return path.resolve(configFileDirectory, extendFile);
    }
    return extendFile;
  }) as OxlintConfigExtends;
};

/**
 * Appends plugins, rules and overrides from the extends configs files to the given config.
 */
export const handleExtendsScope = (extendsConfigs: OxlintConfig[], config: OxlintConfig) => {
  // extendsConfigs is ordered from lowest to highest precedence (last extends wins),
  // the config itself overrides all of them.
  let extendedRules: OxlintConfigRules = {};
  const plugins: OxlintConfigPlugins = [];
  const overrides: OxlintConfigOverride[] = [];
  for (const extendConfig of extendsConfigs) {
    plugins.push(...(readPluginsFromConfig(extendConfig) ?? defaultPlugins));
    extendedRules = { ...extendedRules, ...readRulesFromConfig(extendConfig) };
    overrides.push(...(readOverridesFromConfig(extendConfig) ?? []));
  }
  plugins.push(...(readPluginsFromConfig(config) ?? []));
  const rules: OxlintConfigRules = { ...extendedRules, ...readRulesFromConfig(config) };
  overrides.push(...(readOverridesFromConfig(config) ?? []));
  if (plugins.length > 0) config.plugins = [...new Set<OxlintConfigPlugins[number]>(plugins)];
  if (Object.keys(rules).length > 0) config.rules = rules;
  if (overrides.length > 0) config.overrides = overrides;
};

/**
 * tries to return the content of the chain "extends" section from the config.
 */
export const readExtendsConfigsFromConfig = (config: OxlintConfig): OxlintConfig[] => {
  const extendsFiles = readExtendsFromConfig(config);
  if (!extendsFiles?.length) return [];

  const extendsConfigs: OxlintConfig[] = [];
  for (const file of extendsFiles) {
    // resolved extends from js config, we can directly use it without reading the file content
    if (typeof file === 'string') {
      // for jsonc configs, we can only extend other jsonc configs. no js/ts configs are supported.
      // upstream test coverage: https://github.com/oxc-project/oxc/pull/27554
      const extendConfig = getJsoncContent(file);

      extendConfig[oxlintConfigMeta] = {
        filePath: file,
      };

      resolveRelativeExtendsPaths(extendConfig);

      const extended = readExtendsConfigsFromConfig(extendConfig);
      delete extendConfig.extends;
      extendsConfigs.push(...extended, extendConfig);
    } else {
      const extended = readExtendsConfigsFromConfig(file);
      delete file.extends;
      extendsConfigs.push(...extended, file);
    }
  }
  return extendsConfigs;
};

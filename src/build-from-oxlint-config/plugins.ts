import { OxlintConfig, OxlintConfigPlugins } from './types.js';

/**
 * tries to return the "plugins" section from the config.
 * it returns `undefined` when not found or invalid.
 */
export const readPluginsFromConfig = (
  config: OxlintConfig
): OxlintConfigPlugins | undefined => {
  return 'plugins' in config && Array.isArray(config.plugins)
    ? (config.plugins as OxlintConfigPlugins)
    : undefined;
};

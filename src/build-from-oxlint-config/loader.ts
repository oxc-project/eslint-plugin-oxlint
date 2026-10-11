import fs from 'node:fs';
import { parse as parseJSONC } from 'jsonc-parser';
import { OxlintConfig } from './types.js';
import { isObject } from './utilities.js';
import { pathToFileURL } from 'url';

const JS_EXTENSIONS = ['.js', '.cjs', '.mjs', '.ts', '.mts', '.cts'];
const JSON_EXTENSIONS = ['.json', '.jsonc'];

export const getJsoncContent = (filePath: string): OxlintConfig => {
  let content: string;

  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch {
    throw new Error(`eslint-plugin-oxlint: could not find oxlint config file: ${filePath}`);
  }

  const configContent = parseJSONC(content);

  if (!isObject(configContent)) {
    throw new Error(`eslint-plugin-oxlint: failed to parse JSON config file: ${filePath}`);
  }

  return configContent;
};

const getJsContent = async (filePath: string): Promise<OxlintConfig> => {
  const importedConfig = await import(pathToFileURL(filePath).href);
  const config = isObject(importedConfig.default) ? importedConfig.default : importedConfig;

  if (!isObject(config)) {
    throw new TypeError('not an valid config file');
  }

  return config;
};

/**
 * tries to read the oxlint config file and returning its JSON content.
 * if the file is not found or could not be parsed, undefined is returned.
 * And an error message will be emitted to `console.error`
 */
export const getConfigContent = async (oxlintConfigFile: string): Promise<OxlintConfig> => {
  if (JS_EXTENSIONS.some((ext) => oxlintConfigFile.endsWith(ext))) {
    return getJsContent(oxlintConfigFile);
  }
  if (JSON_EXTENSIONS.some((ext) => oxlintConfigFile.endsWith(ext))) {
    return Promise.resolve(getJsoncContent(oxlintConfigFile));
  }
  throw new Error(
    `eslint-plugin-oxlint: unsupported oxlint config file extension: ${oxlintConfigFile}, only ${JS_EXTENSIONS.concat(JSON_EXTENSIONS).join(', ')} are supported`
  );
};

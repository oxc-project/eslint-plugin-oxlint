import fs from 'node:fs';
import { type ParseError, parse as parseJSONC } from 'jsonc-parser';
import { type OxlintConfig, type OxlintConfigJson, oxlintConfigMeta } from './types.js';
import { isObject } from './utilities.js';
import { pathToFileURL } from 'url';
import path from 'node:path';

const JS_EXTENSIONS = ['.js', '.cjs', '.mjs', '.ts', '.mts', '.cts'];
const JSON_EXTENSIONS = ['.json', '.jsonc'];

export const getJsoncContent = (filePath: string): OxlintConfigJson => {
  let content: string;

  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    throw new Error(`eslint-plugin-oxlint: could not read oxlint config file: ${filePath}`, {
      cause: e,
    });
  }

  const errors: ParseError[] = [];
  const configContent: Record<string | symbol, unknown> = parseJSONC(content, errors, {
    allowTrailingComma: true,
  });

  if (errors.length > 0) {
    throw new Error(`eslint-plugin-oxlint: failed to parse JSON config file: ${filePath}`);
  }

  if (!isObject(configContent)) {
    throw new Error(`eslint-plugin-oxlint: failed to parse JSON config file: ${filePath}`);
  }

  configContent[oxlintConfigMeta] = {
    filePath: path.resolve(filePath),
  };

  return configContent;
};

const getJsContent = async (filePath: string): Promise<OxlintConfig> => {
  const importedConfig = await import(pathToFileURL(filePath).href);
  const config = isObject(importedConfig.default) ? importedConfig.default : importedConfig;

  if (!isObject(config)) {
    throw new TypeError(`eslint-plugin-oxlint: not a valid config file: ${filePath}`);
  }

  return config;
};

/**
 * tries to read the oxlint config file and returning its JSON content.
 * if the file is not found or could not be parsed, and error is thrown.
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

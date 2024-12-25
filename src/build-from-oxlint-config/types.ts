import type { Linter } from 'eslint';

export type OxlintConfigPlugins = string[];

export type OxlintConfigCategories = Record<string, unknown>;

export type OxlintConfigRules = Record<string, unknown>;

export type OxlintConfigIgnorePatterns = string[];

export type EslintPluginOxlintConfig = Linter.Config<Record<string, 'off'>>;

export type OxlintConfigOverride = {
  files: string[];
  plugins?: OxlintConfigPlugins;
  rules?: OxlintConfigRules;
};

export type OxlintConfig = {
  [key: string]: unknown;
  plugins?: OxlintConfigPlugins;
  categories?: OxlintConfigCategories;
  rules?: OxlintConfigRules;
  ignorePatterns?: OxlintConfigIgnorePatterns;
};

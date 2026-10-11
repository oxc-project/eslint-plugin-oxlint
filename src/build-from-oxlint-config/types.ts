import type { Linter } from 'eslint';
import type { OxlintConfig as OxlintConfigJsInternal } from 'oxlint';

export const oxlintConfigMeta = Symbol('eslint-plugin-oxlint config metadata');

export type BuildFromOxlintConfigOptions = {
  withNursery?: boolean;
  typeAware?: boolean;
};

export type OxlintConfigExtends = Exclude<OxlintConfig['extends'], undefined>;
export type OxlintConfigPlugins = Exclude<OxlintConfig['plugins'], undefined> & string[];
export type OxlintConfigCategories = Exclude<OxlintConfig['categories'], undefined>;
export type OxlintConfigRules = Exclude<OxlintConfig['rules'], undefined>;
export type OxlintConfigIgnorePatterns = Exclude<OxlintConfig['ignorePatterns'], undefined>;
export type OxlintOptions = Exclude<OxlintConfig['options'], undefined>;
export type OxlintConfigOverride = Exclude<OxlintConfig['overrides'], undefined>[number];

export type EslintPluginOxlintConfig = Linter.Config<Record<string, 'off'>>;

type OxlintConfigJs = Omit<OxlintConfigJsInternal, 'extends' | 'rules'> & {
  rules?: Record<string, unknown>;
  extends?: OxlintConfigJs[];
};

type OxlintConfigJson = Omit<OxlintConfigJs, 'extends'> & {
  $schema?: string;
  extends?: string[];
};

type OxlintConfigMeta = {
  // extra properties only used by `eslint-plugin-oxlint`
  [oxlintConfigMeta]?: {
    // absolute path to the config file
    filePath: string;
  };
};

export type OxlintConfig = (OxlintConfigJs | OxlintConfigJson) & OxlintConfigMeta;

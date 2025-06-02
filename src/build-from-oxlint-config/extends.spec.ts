import { describe, expect, it } from 'vitest';
import { handleExtendsScope, resolveRelativeExtendsPaths } from './extends.js';
import { OxlintConfig } from './types.js';

describe('handleExtendsScope', () => {
  it('should handle empty extends configs', () => {
    const extendsConfigs: OxlintConfig[] = [];
    const config: OxlintConfig = {
      plugins: ['react'],
      categories: { correctness: 'warn' },
      rules: { eqeqeq: 'error' },
    };
    handleExtendsScope(extendsConfigs, config);
    expect(config).toEqual(config);
  });

  it('should merge extends configs', () => {
    const extendsConfigs: OxlintConfig[] = [
      {
        plugins: ['react', 'unicorn'],
        categories: { correctness: 'error' },
        rules: { rule1: 'error' },
      },
    ];
    const config: OxlintConfig = {
      categories: { correctness: 'warn' },
      rules: { rule3: 'warn' },
    };
    handleExtendsScope(extendsConfigs, config);
    expect(config).toEqual({
      plugins: ['react', 'unicorn'],
      categories: config.categories,
      rules: { rule1: 'error', rule3: 'warn' },
    });
  });

  it('should merge extends and de duplicate plugins and rules', () => {
    const extendsConfigs: OxlintConfig[] = [
      {
        plugins: ['react', 'typescript'],
        categories: { correctness: 'error' },
        rules: { rule1: 'error', rule2: 'error' },
      },
    ];
    const config: OxlintConfig = {
      plugins: ['react', 'unicorn'],
      categories: { correctness: 'warn' },
      rules: { rule1: 'warn' },
    };
    handleExtendsScope(extendsConfigs, config);
    expect(config).toEqual({
      plugins: ['react', 'typescript', 'unicorn'],
      categories: config.categories,
      rules: { rule1: 'warn', rule2: 'error' },
    });
  });

  it('should merge multiple extends configs', () => {
    const extendsConfigs: OxlintConfig[] = [
      {
        plugins: ['react', 'unicorn'],
        categories: { correctness: 'error' },
        rules: { rule1: 'error', rule2: 'error' },
      },
      {
        plugins: ['typescript'],
        overrides: [{ files: ['*.ts'], rules: { rule3: 'error' } }],
      },
    ];
    const config: OxlintConfig = {
      plugins: ['react', 'vitest'],
      categories: { correctness: 'warn' },
      rules: { rule1: 'warn' },
    };
    handleExtendsScope(extendsConfigs, config);
    expect(config).toEqual({
      plugins: ['typescript', 'react', 'unicorn', 'vitest'],
      categories: config.categories,
      rules: { rule1: 'warn', rule2: 'error' },
      overrides: [{ files: ['*.ts'], rules: { rule3: 'error' } }],
    });
  });

  it('should merge multiple extends configs with multiple overrides', () => {
    const extendsConfigs: OxlintConfig[] = [
      {
        plugins: ['react', 'unicorn'],
        categories: { correctness: 'error' },
        rules: { rule1: 'error', rule2: 'error' },
      },
      {
        plugins: ['typescript'],
        overrides: [{ files: ['*.ts'], rules: { rule3: 'error' } }],
      },
    ];
    const config: OxlintConfig = {
      plugins: ['react', 'vitest'],
      categories: { correctness: 'warn' },
      rules: { rule1: 'warn' },
      overrides: [{ files: ['*.spec.ts'], rules: { rule4: 'error' } }],
    };
    handleExtendsScope(extendsConfigs, config);
    expect(config).toEqual({
      plugins: ['typescript', 'react', 'unicorn', 'vitest'],
      categories: config.categories,
      rules: { rule1: 'warn', rule2: 'error' },
      overrides: [
        { files: ['*.ts'], rules: { rule3: 'error' } },
        { files: ['*.spec.ts'], rules: { rule4: 'error' } },
      ],
    });
  });
});

describe('resolveRelativeExtendsPaths', () => {
  it('should resolve relative paths', () => {
    const config: OxlintConfig = {
      extends: [
        './extends1.json',
        './folder/extends2.json',
        '../parent/extends3.json',
      ],
      __misc: {
        filePath: '/root/of/the/file/test-config.json',
      },
    };
    resolveRelativeExtendsPaths(config);

    expect(config.extends).toEqual([
      '/root/of/the/file/extends1.json',
      '/root/of/the/file/folder/extends2.json',
      '/root/of/the/parent/extends3.json',
    ]);
  });
});

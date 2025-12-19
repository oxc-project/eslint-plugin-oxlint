import { describe, expect, it } from 'vitest';
import { handleCategoriesScope } from './categories.js';

describe('handleCategoriesScope', () => {
  it('default plugins (react, unicorn, typescript), default categories', () => {
    const rules = {};
    handleCategoriesScope(
      ['eslint', 'unicorn', 'react', 'typescript'],
      {
        correctness: 'warn',
      },
      rules
    );

    // snapshot because it can change with the next release
    expect(rules).toMatchSnapshot('defaultPluginDefaultCategories');
  });

  it('skip deactivate categories', () => {
    const rules = {};
    handleCategoriesScope(['unicorn', 'react', 'typescript'], {}, rules);

    expect(rules).toStrictEqual({});
  });

  it('custom plugins, default categories', () => {
    const rules = {};
    handleCategoriesScope(
      ['eslint', 'unicorn'],
      {
        correctness: 'warn',
      },
      rules
    );
    // snapshot because it can change with the next release
    expect(rules).toMatchSnapshot('customPluginDefaultCategories');
  });

  it('custom plugins, custom categories', () => {
    const rules = {};
    handleCategoriesScope(
      ['eslint', 'import'],
      {
        suspicious: 'warn',
        correctness: 'off',
      },
      rules
    );
    // snapshot because it can change with the next release
    expect(rules).toMatchSnapshot('customPluginCustomCategories');
  });

  it('skip deactivate rules, for custom enable category', () => {
    const rules = {
      'import/no-self-import': 'off',
    } as const;
    handleCategoriesScope(
      ['eslint', 'import'],
      {
        suspicious: 'warn',
        correctness: 'off',
      },
      rules
    );

    expect(rules['import/no-self-import']).toBe('off');
  });

  it('includes type-aware rules when typeAware=true', () => {
    const rules: Record<string, 'off'> = {};
    handleCategoriesScope(
      ['eslint', 'typescript'],
      {
        correctness: 'warn',
      },
      rules,
      { typeAware: true }
    );

    // Comes from correctnessTypeAwareRules and requires typescript plugin
    expect(rules['@typescript-eslint/no-floating-promises']).toBe('off');
    // Base correctness rule should still be included
    expect(rules['@typescript-eslint/no-unused-vars']).toBe('off');
  });

  it('excludes type-aware rules when typeAware=false (default)', () => {
    const rules: Record<string, 'off'> = {};
    handleCategoriesScope(
      ['eslint', 'typescript'],
      {
        correctness: 'warn',
      },
      rules,
      { typeAware: false }
    );

    // Type-aware rule should not be present
    expect(rules['@typescript-eslint/no-floating-promises']).toBeUndefined();
    // Base correctness rule should be present
    expect(rules['@typescript-eslint/no-unused-vars']).toBe('off');
  });
});

import { describe, expect, it } from 'vite-plus/test';
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

  it('react plugin also covers the rules it owns under other eslint plugin prefixes', () => {
    const rules: Record<string, 'off'> = {};
    handleCategoriesScope(['react'], { correctness: 'warn', restriction: 'warn' }, rules);

    // The React Compiler rules are namespaced `react/*` by oxlint, but upstream they live in
    // eslint-plugin-react-hooks. Emitting `react/purity` would switch off nothing, because
    // eslint-plugin-react has no such rule.
    expect(rules['react-hooks/purity']).toBe('off');
    expect(rules['react-hooks/set-state-in-effect']).toBe('off');
    expect(rules['react-hooks/exhaustive-deps']).toBe('off');
    expect(rules).not.toHaveProperty('react/purity');
    expect(rules).not.toHaveProperty('react/set-state-in-effect');

    // same story for eslint-plugin-react-refresh
    expect(rules['react-refresh/only-export-components']).toBe('off');

    // rules that really are eslint-plugin-react ones keep the `react/` prefix
    expect(rules['react/no-children-prop']).toBe('off');
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

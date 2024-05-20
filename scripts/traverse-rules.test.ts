import type { Rule } from './traverse-rules.js';
import {
  getFileNameWithoutExtension,
  getFolderNameUnderRules,
} from './traverse-rules.js';
import { suite, expect, test, vi, afterEach, beforeEach } from 'vitest';
import { readFilesRecursively } from './traverse-rules.js';
import { type fs, vol } from 'memfs';
import dedent from 'dedent';

suite('getFileNameWithoutExtension', () => {
  test('getFileNameWithoutExtension returns correct file name without extension', () => {
    const filePath = '/path/to/file.rs';
    const currentDirectory = '/path/to';
    const expectedFileName = 'file';

    const result = getFileNameWithoutExtension(filePath, currentDirectory);

    expect(result).toEqual(expectedFileName);
  });

  test("getFileNameWithoutExtension returns current directory name when file name is 'mod.rs'", () => {
    const filePath = '/path/to/mod.rs';
    const currentDirectory = '/path/to';
    const expectedFileName = 'to';

    const result = getFileNameWithoutExtension(filePath, currentDirectory);

    expect(result).toEqual(expectedFileName);
  });
});

suite('getFolderNameUnderRules', () => {
  test("getFolderNameUnderRules returns empty string when 'rules' directory not found", () => {
    const filePath = '/path/to/file.ts';
    const expectedFolderName = '';

    const result = getFolderNameUnderRules(filePath);

    expect(result).toEqual(expectedFolderName);
  });

  test("getFolderNameUnderRules returns folder name directly under 'rules'", () => {
    const filePath = '/path/to/rules/folder/file.ts';
    const expectedFolderName = 'folder';

    const result = getFolderNameUnderRules(filePath);

    expect(result).toEqual(expectedFolderName);
  });

  test("getFolderNameUnderRules returns remaining path if there's no additional '/'", () => {
    const filePath = '/path/to/rules/file.ts';
    const expectedFolderName = 'file.ts';

    const result = getFolderNameUnderRules(filePath);

    expect(result).toEqual(expectedFolderName);
  });
});

suite('readFilesRecursively', () => {
  beforeEach(() => {
    vi.mock('node:fs', async () => {
      const memfs: { fs: typeof fs } = await vi.importActual('memfs');
      return {
        promises: memfs.fs.promises,
      };
    });
  });

  afterEach(() => {
    vol.reset();
    vi.restoreAllMocks();
  });

  test('readFilesRecursively recursively reads files and directories', async () => {
    // Prepare test data
    const successResultArray: Rule[] = [];
    const skippedResultArray: Rule[] = [];
    const failureResultArray: Rule[] = [];

    vol.fromJSON({
      'crates/src/rules/eslint/rulename-with-mod/mod.rs': 'content',
      'crates/src/rules/typescript/rulename-without-mod.rs': 'content',
      'crates/src/rules/oxc/rulename-which-will-be-skipped.rs': 'content',
    });

    // Call the function
    await readFilesRecursively(
      '.',
      successResultArray,
      skippedResultArray,
      failureResultArray
    );

    expect(successResultArray.length).toEqual(0);
    expect(skippedResultArray.length).toEqual(1);
    expect(failureResultArray.length).toEqual(2);

    expect(successResultArray).toEqual([]);
    expect(skippedResultArray).toEqual([
      {
        category: 'unknown',
        scope: 'oxc',
        value: 'oxc/rulename-which-will-be-skipped',
      },
    ]);
    expect(failureResultArray).toEqual([
      {
        category: 'unknown',
        error: 'No match block for `declare_oxc_lint`',
        scope: 'eslint',
        value: 'rulename-with-mod',
      },
      {
        category: 'unknown',
        error: 'No match block for `declare_oxc_lint`',
        scope: 'typescript',
        value: '@typescript-eslint/rulename-without-mod',
      },
    ]);
  });

  test('readFilesRecursively returns parsed rules correctly', async () => {
    // Prepare test data
    const successResultArray: Rule[] = [];
    const skippedResultArray: Rule[] = [];
    const failureResultArray: Rule[] = [];

    const ruleNameWithModuleContent = dedent(`declare_oxc_lint!(
      /// Some Block Content
      /// ) extra parenthesis to make sure it doesn't catch
      DefaultCaseLast,
      style
    )`);

    const ruleNameWithoutModuleContent = dedent(`declare_oxc_lint!(
      /// ### What it does
      /// Disallow calling some global objects as functions
      NoObjCalls,
      correctness
    )`);

    vol.fromJSON({
      'crates/src/rules/eslint/rulename-with-mod/mod.rs':
        ruleNameWithModuleContent,
      'crates/src/rules/typescript/rulename-without-mod.rs':
        ruleNameWithoutModuleContent,
    });

    // Call the function
    await readFilesRecursively('.', successResultArray, [], []);

    expect(successResultArray).toEqual([
      {
        category: 'style',
        scope: 'eslint',
        value: 'rulename-with-mod',
      },
      {
        category: 'correctness',
        scope: 'typescript',
        value: '@typescript-eslint/rulename-without-mod',
      },
    ]);

    expect(skippedResultArray).toEqual([]);
    expect(failureResultArray).toEqual([]);
  });

  test('readFilesRecursively returns non-parsed rules correctly', async () => {
    // Prepare test data
    const successResultArray: Rule[] = [];
    const skippedResultArray: Rule[] = [];
    const failureResultArray: Rule[] = [];

    const badContent = 'bad content';

    vol.fromJSON({
      'crates/src/rules/eslint/rulename-that-will-be-skipped-because-no-match-block.rs':
        badContent,
      'crates/src/rules/oxc/rulename-that-will-be-skipped-because-bad-content-or-scope.rs':
        badContent,
      'crates/src/rules/oxc/rulename-that-will-be-skipped-because-skip-scope.rs':
        badContent,
      'crates/src/rules/typescript/rulename-that-will-error.rs': badContent,
    });

    // Call the function
    await readFilesRecursively(
      '.',
      successResultArray,
      skippedResultArray,
      failureResultArray
    );

    expect(successResultArray).toEqual([]);
    expect(skippedResultArray).toEqual([
      {
        category: 'unknown',
        scope: 'oxc',
        value: 'oxc/rulename-that-will-be-skipped-because-bad-content-or-scope',
      },
      {
        category: 'unknown',
        scope: 'oxc',
        value: 'oxc/rulename-that-will-be-skipped-because-skip-scope',
      },
    ]);

    expect(failureResultArray).toEqual([
      {
        category: 'unknown',
        error: 'No match block for `declare_oxc_lint`',
        scope: 'eslint',
        value: 'rulename-that-will-be-skipped-because-no-match-block',
      },
      {
        category: 'unknown',
        error: 'No match block for `declare_oxc_lint`',
        scope: 'typescript',
        value: '@typescript-eslint/rulename-that-will-error',
      },
    ]);
  });
});

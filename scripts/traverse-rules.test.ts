import {
  getFileNameWithoutExtension,
  getFolderNameUnderRules,
} from './traverse-rules.js';
import { suite, expect, test } from 'vitest';

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

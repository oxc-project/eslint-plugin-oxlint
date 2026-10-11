import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { fileURLToPath } from 'node:url';
import { getConfigContent } from './loader.js';

const fixturePath = (name: string) =>
  fileURLToPath(new URL(`./__fixtures__/${name}`, import.meta.url));

describe('getConfigContent', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(['.oxlintrc.json', '.oxlintrc.jsonc', 'oxlint.config.js', 'oxlint.config.ts'])(
    'loads %s config files',
    async (fileName) => {
      await expect(getConfigContent(fixturePath(fileName))).resolves.toEqual({
        rules: { eqeqeq: 'error' },
      });
    }
  );

  it('returns undefined and reports unsupported extensions', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const filePath = fixturePath('unsupported.yaml');

    await expect(getConfigContent(filePath)).resolves.toBeUndefined();
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining(`unsupported oxlint config file extension: ${filePath}`)
    );
  });

  it('returns undefined and reports missing config files', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const filePath = fixturePath('missing.json');

    await expect(getConfigContent(filePath)).resolves.toBeUndefined();
    expect(error).toHaveBeenCalledWith(
      `eslint-plugin-oxlint: could not find oxlint config file: ${filePath}`
    );
  });
});

import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { fileURLToPath } from 'node:url';
import { getConfigContent } from './loader.js';
import { oxlintConfigMeta } from './types.js';

const fixturePath = (name: string) =>
  fileURLToPath(new URL(`./__fixtures__/${name}`, import.meta.url));

describe('getConfigContent', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(['oxlint.config.js', 'oxlint.config.ts'])('loads %s config file', async (fileName) => {
    await expect(getConfigContent(fixturePath(fileName))).resolves.toEqual({
      rules: { eqeqeq: 'error' },
    });
  });

  it.each(['.oxlintrc.json', '.oxlintrc.jsonc'])(
    'loads %s config file with meta information',
    async (fileName) => {
      await expect(getConfigContent(fixturePath(fileName))).resolves.toEqual({
        rules: { eqeqeq: 'error' },
        [oxlintConfigMeta]: {
          filePath: fixturePath(fileName),
        },
      });
    }
  );

  it('fails to parse invalid JSON', async () => {
    const filePath = fixturePath('invalid-json.json');

    await expect(getConfigContent(filePath)).rejects.toThrow(
      new Error(`eslint-plugin-oxlint: failed to parse JSON config file: ${filePath}`)
    );
  });

  it('fails to parse invalid config', async () => {
    const filePath = fixturePath('invalid-config.json');

    await expect(getConfigContent(filePath)).rejects.toThrow(
      new Error(`eslint-plugin-oxlint: failed to parse JSON config file: ${filePath}`)
    );
  });

  it('throws and reports unsupported extensions', async () => {
    const filePath = fixturePath('unsupported.yaml');

    await expect(getConfigContent(filePath)).rejects.toThrow(
      new Error(
        `eslint-plugin-oxlint: unsupported oxlint config file extension: ${filePath}, only .js, .cjs, .mjs, .ts, .mts, .cts, .json, .jsonc are supported`
      )
    );
  });

  it('throws and reports missing config files', async () => {
    const filePath = fixturePath('missing.json');

    await expect(getConfigContent(filePath)).rejects.toThrow(
      new Error(`eslint-plugin-oxlint: could not read oxlint config file: ${filePath}`)
    );
  });
});

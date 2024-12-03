import path from 'node:path';
import dts from 'vite-plugin-dts';
import { defineConfig, Plugin } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      include: ['src', 'scripts'],
    },
  },
  build: {
    lib: {
      entry: [path.resolve(import.meta.dirname, 'src/index.ts')],
      fileName: (format, entryName) => {
        return `${entryName}.${format === 'es' ? 'mjs' : 'cjs'}`;
      },
      name: 'eslint-plugin-oxlint',
      formats: ['cjs', 'es'],
    },
    rollupOptions: {
      external: (id: string) => !id.startsWith('.') && !path.isAbsolute(id),
      output: {
        preserveModules: true,
      },
    },
    minify: false,
  },
  plugins: [
    dts({
      include: 'src/**',
      exclude: 'src/**/*.spec.ts',
    }) as Plugin,
  ],
});

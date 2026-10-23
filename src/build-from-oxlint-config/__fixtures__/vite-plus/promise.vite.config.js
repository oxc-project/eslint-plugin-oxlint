import { defineConfig } from 'vite-plus';

export default defineConfig(Promise.resolve({
  lint: {
    rules: {
      eqeqeq: 'error',
    },
  },
}));

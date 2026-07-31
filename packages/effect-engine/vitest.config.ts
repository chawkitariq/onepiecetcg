import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@jest/globals': fileURLToPath(
        new URL('./vitest.jest-globals.ts', import.meta.url),
      ),
    },
  },
  test: {
    globals: true,
    include: ['src/**/*.spec.ts'],
  },
});

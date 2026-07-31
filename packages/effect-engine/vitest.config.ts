import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: [
      {
        find: '@jest/globals',
        replacement: fileURLToPath(
          new URL('./vitest.jest-globals.ts', import.meta.url),
        ),
      },
      {
        find: /^@onepiecetcg\/cards\/effects$/,
        replacement: fileURLToPath(
          new URL('../cards/src/effects/index.ts', import.meta.url),
        ),
      },
      {
        find: /^@onepiecetcg\/cards\/effects\//,
        replacement: fileURLToPath(new URL('../cards/src/effects/', import.meta.url)),
      },
    ],
  },
  test: {
    globals: true,
    include: ['src/**/*.spec.ts'],
  },
});

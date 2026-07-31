import { fileURLToPath } from 'node:url';
import { defineConfig } from '../web/node_modules/vitest/dist/config.js';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.spec.ts', 'effects/**/*.spec.ts'],
  },
});

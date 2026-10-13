import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import path from 'path';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  oxc: {
    jsx: {
      runtime: 'automatic',
    },
  },
  test: {
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@': path.resolve(currentDir, './src'),
      'react-router-dom': path.resolve(currentDir, './src/lib/next-router-compat.tsx'),
    },
  },
});

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['**/node_modules/**', '**/dist/**', 'apps/ui/**'],
    coverage: {
      provider: 'v8',
      reporter: ['html', 'text-summary'],
      exclude: ['scripts/**', 'apps/ui/**'],
      thresholds: {
        statements: 60,
        branches: 60,
        functions: 60,
        lines: 60,
      },
    },
  },
});

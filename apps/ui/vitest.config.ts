import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');

export default defineConfig({
  resolve: {
    alias: {
      '@cli/shared': path.resolve(repoRoot, 'src', 'cli', 'shared'),
      '@todo/core': path.resolve(repoRoot, 'src', 'todo', 'core')
    }
  },
  test: {
    // Enable globals for cleaner test syntax (describe, it, expect available without imports)
    globals: true,

    // Use jsdom for DOM testing environment (React components need DOM)
    environment: 'jsdom',

    // Setup file runs before each test file
    setupFiles: './src/setupTests.ts',

    // Exclude common non-test directories
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/playwright/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
    ],

    // Coverage configuration
    coverage: {
      // Use v8 for faster, more accurate coverage
      provider: 'v8',

      // Output formats: text for terminal, html for browsing, json-summary for CI
      reporter: ['text', 'html', 'json-summary'],

      // Where coverage reports are written
      reportsDirectory: './coverage',

      // Exclude common non-source files from coverage
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/playwright/**',
        '**/*.config.*',
        '**/.eslintrc.cjs',
        '**/setupTests.ts',
        '**/*.d.ts',
        '**/main.tsx', // App entry point - integration-tested, not unit-tested
        '**/vite-env.d.ts',
        '**/ErrorBoundary.tsx', // Error boundary - resilience component with specialized testing needs
      ],

      // Enforce minimum coverage thresholds (Week 3 requirement: ≥ 50%)
      thresholds: {
        statements: 50,
        branches: 50,
        functions: 50,
        lines: 50,
      },

      // Include source files even if not explicitly imported by tests
      all: true,
      include: ['src/**/*.{ts,tsx}'],
    },
  },
});

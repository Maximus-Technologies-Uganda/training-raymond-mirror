/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@cli/shared': path.resolve(repoRoot, 'src', 'cli', 'shared'),
            '@todo/core': path.resolve(repoRoot, 'src', 'todo', 'core')
        }
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.ts',
        exclude: ['**/node_modules/**', '**/playwright/**', '**/dist/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'json-summary'],
            reportsDirectory: './coverage/unit',
            exclude: ['**/node_modules/**', '**/playwright/**', '**/dist/**', '**/*.config.*']
        }
    }
});

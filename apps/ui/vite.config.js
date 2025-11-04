/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.ts',
        exclude: ['**/node_modules/**', '**/playwright/**', '**/dist/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'json-summary'],
            reportsDirectory: './coverage/unit',
            exclude: [
                '**/node_modules/**',
                '**/playwright/**',
                '**/dist/**',
                '**/*.config.*',
                '**/.eslintrc.cjs',
                '**/setupTests.ts',
                '**/*.d.ts'
            ],
            thresholds: {
                statements: 50,
                branches: 50,
                functions: 50,
                lines: 50
            }
        }
    }
});

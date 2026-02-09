import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@dependabit/manifest': resolve(__dirname, './packages/manifest/dist'),
      '@dependabit/action': resolve(__dirname, './packages/action/dist'),
      '@dependabit/core': resolve(__dirname, './packages/core/dist'),
      '@dependabit/detector': resolve(__dirname, './packages/detector/dist'),
      '@dependabit/github-client': resolve(__dirname, './packages/github-client/dist'),
      '@dependabit/monitor': resolve(__dirname, './packages/monitor/dist'),
      '@dependabit/utils': resolve(__dirname, './packages/utils/dist'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/**/test/**/*.test.ts', 'packages/**/src/**/*.test.ts', 'e2e/**/*.spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/build/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['packages/*/src/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.spec.ts', '**/test/**', '**/dist/**', '**/node_modules/**'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    },
    typecheck: {
      enabled: false // Run type checking separately with tsc
    }
  }
});

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    // Default: node (pure functions, schemas, route handlers).
    // Override per file with // @vitest-environment happy-dom for component tests.
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      include: [
        'core/lib/**',
        'modules/*/services/schema.ts',
        'app/api/auth/**',
      ],
      exclude: [
        '**/*.d.ts',
        'node_modules/**',
        '.next/**',
        '_rebuild/**',
        '_contract/**',
      ],
      thresholds: {
        lines: 70,
        branches: 60,
        functions: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});

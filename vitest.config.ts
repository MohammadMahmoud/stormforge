import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    hookTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      include: ['src/server.ts', 'src/modules/user/user.routes.ts'],
      exclude: ['src/**/*.d.ts', 'node_modules/**'],
      thresholds: {
        lines: 70,
        functions: 75,
        branches: 50,
        statements: 70,
      },
      watermarks: {
        lines: [80, 90],
        functions: [80, 95],
        branches: [75, 90],
        statements: [80, 90],
      },
    },
  },
});

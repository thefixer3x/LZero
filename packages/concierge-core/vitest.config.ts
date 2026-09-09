import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'concierge-core',
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts'],
  },
});

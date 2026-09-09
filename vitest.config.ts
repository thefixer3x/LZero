import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Suite scope: LZero's own tests. The vendored @lanonasis/concierge-core
    // workspace member is a dependency, not LZero test surface — its own tests
    // run in the lan-onasis-monorepo pipeline (see packages/concierge-core/VENDORED.md).
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'packages/concierge-core/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/examples/**'
      ]
    }
  }
});

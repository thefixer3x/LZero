import { defineConfig, globalIgnores } from 'eslint/config';
import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import nextVitals from 'eslint-config-next/core-web-vitals.js';
import nextTs from 'eslint-config-next/typescript.js';

// Modern Next releases no longer expose `next lint`; run ESLint directly with
// the same Next ruleset the old command applied.
const __dirname = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

export default defineConfig([
  ...compat.config(nextVitals),
  ...compat.config(nextTs),
  {
    rules: {
      '@typescript-eslint/no-require-imports': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react/no-unescaped-entities': 'warn',
    },
  },
  globalIgnores([
    '.next/**',
    '.vercel/**',
    'node_modules/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'public/**',
    'attached_assets/**',
  ]),
]);

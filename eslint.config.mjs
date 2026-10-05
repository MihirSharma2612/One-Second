import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    // Local SVG placeholders intentionally use plain images until media integration.
    rules: { '@next/next/no-img-element': 'off' },
  },
  globalIgnores(['.next/**', 'out/**', 'next-env.d.ts']),
]);

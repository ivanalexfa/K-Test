// ESLint del frontend de K-test. Decisión en docs/general/decisiones/0002-calidad-lint-y-pruebas.md
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default tseslint.config(
  {
    ignores: [
      'dist',
      'node_modules',
      'api/**', // bundle generado por scripts/build-api.mjs
      'coverage',
      'playwright-report',
      'test-results',
      '.claude/**',
      // Backend (Iván): fuera del lint del frontend por ahora; ver el ADR 0002.
      'server/**',
      'scripts/**',
    ],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      jsxA11y.flatConfigs.recommended,
      reactHooks.configs.flat.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Deuda conocida: ~20 `any` heredados en src. Aviso, no error, hasta limpiarlos
      // (el código nuevo no debe agregar más). Ver el ADR 0002.
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    files: ['e2e/**/*.ts', '*.config.{js,ts}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
);

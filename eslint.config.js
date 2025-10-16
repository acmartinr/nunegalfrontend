// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  // Ignorar generados
  { ignores: ['dist', 'build', 'node_modules'] },

  // Bloque principal (React + JSX)
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { react, 'jsx-a11y': jsxA11y },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'jsx-a11y/alt-text': 'warn',
    },
    settings: { react: { version: 'detect' } },
  },

  // 🔥 Bloque específico para tests (Vitest)
  {
    files: ['**/__tests__/**/*.{js,jsx}', '**/*.test.{js,jsx}'],
    languageOptions: {
      // 1) añade las globals de vitest…
      globals: {
        ...globals.node,
        ...globals.vitest, // describe, it, test, expect, vi, beforeEach, afterEach…
        // 2) …y además las definimos explícitamente por si el paquete 'globals' falla
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
    // (opcional) puedes relajar alguna regla sólo en tests si hace falta
    rules: {},
  },
];

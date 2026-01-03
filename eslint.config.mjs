// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'dist', 'node_modules'],
  },

  // Базовые рекомендации ESLint
  eslint.configs.recommended,

  // TypeScript (type-aware)
  ...tseslint.configs.recommendedTypeChecked,

  // Prettier — ВСЕГДА после остальных
  eslintPluginPrettierRecommended,

  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    plugins: {
      'simple-import-sort': simpleImportSort,
    },

    rules: {
      /* ----------------------------------
       * Prettier
       * ---------------------------------- */
      // 'prettier/prettier': 'error',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],

      /* ----------------------------------
       * Imports
       * ---------------------------------- */
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      /* ----------------------------------
       * TypeScript quality
       * ---------------------------------- */
      '@typescript-eslint/no-explicit-any': 'off',

      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      /* ----------------------------------
       * Promises / async
       * ---------------------------------- */
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-misused-promises': [
        'warn',
        {
          checksVoidReturn: false,
        },
      ],
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',

      /* ----------------------------------
       * Nest / Node sanity
       * ---------------------------------- */
      'no-console': 'off', // Nest логирует через console
      'no-process-exit': 'off',

      /* ----------------------------------
       * General code health
       * ---------------------------------- */
      'prefer-const': 'warn',
      'no-var': 'error',
    },
  },
);

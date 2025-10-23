import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';

export default [
  // Ignorar archivos y carpetas que no queremos lint
  { ignores: ['eslint.config.js', 'node_modules/**', 'coverage/**', 'dist/**'] },

  js.configs.recommended,

  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    plugins: { prettier },
    rules: {
      // Integra Prettier como warning
      'prettier/prettier': 'warn',

      // Ajustes útiles en backend
      'no-underscore-dangle': ['error', { allow: ['_id'] }],
    },
  },
];

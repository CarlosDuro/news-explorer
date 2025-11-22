import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';

export default [
  { ignores: ['eslint.config.js', 'node_modules/**', 'coverage/**', 'dist/**'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node },
    },
    plugins: { prettier },
    rules: {
      'prettier/prettier': 'warn',
      'no-underscore-dangle': ['error', { allow: ['_id'] }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];

const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const reactPlugin = require('eslint-plugin-react');

/** @type {import('eslint').FlatConfig[]} */
module.exports = [
  {
    ignores: ["node_modules", "dist", "build", "server"],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
        project: "./tsconfig.json",
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react': reactPlugin,
    },
    rules: {
      'no-unused-vars': 'warn',
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
]; 
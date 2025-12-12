import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    // Match all TypeScript files in the project
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // Arrow function rules
      'func-style': ['error', 'expression', { allowArrowFunctions: true }],
      'prefer-arrow-callback': 'error',

      // Disallow regular functions
      'no-restricted-syntax': [
        'error',
        {
          selector: 'FunctionDeclaration',
          message: 'Use arrow functions instead of function declarations',
        },
        {
          selector: 'FunctionExpression',
          message: 'Use arrow functions instead of function expressions',
        },
      ],

      // Basic TypeScript rules
      '@typescript-eslint/no-unused-vars': 'error',

      // Formatting
      semi: ['error', 'always'],
      quotes: ['warn', 'single'],
    },
  },
];

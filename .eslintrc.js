module.exports = {
  root: true,
  env: { node: true, es6: true },

  // Enable features such as async/await
  parserOptions: {
    ecmaVersion: 2019,
  },

  plugins: ['eslint-plugin-import', 'jsdoc', '@typescript-eslint'],

  // Extend eslint recommended rules
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'prettier',
  ],

  ignorePatterns: ['node_modules', 'dist'],

  rules: {
    'require-await': 'error',

    'jsdoc/require-jsdoc': [
      'error',
      {
        enableFixer: false,
        checkConstructors: false,
        require: { FunctionDeclaration: true, MethodDefinition: true },
      },
    ],

    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal'],
        pathGroups: [
          {
            pattern: 'next/**',
            group: 'external',
            position: 'before',
          },
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
  },

  overrides: [
    /**
     * TypeScript Files
     */
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      rules: {
        // No unused variables
        '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
      },
    },

    /**
     * Controllers
     */
    {
      files: ['**/*.controller.ts'],
      rules: {
        // No need for jsdoc in controllers: the API notations are enough
        'jsdoc/require-jsdoc': 'off',
      },
    },

    /**
     * Test files
     */
    {
      files: ['test/**/*', '**spec.ts'],
      env: { jest: true },
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/ban-types': 'off',
        'jsdoc/require-jsdoc': 'off',
      },
    },
  ],
}

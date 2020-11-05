module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    jest: true,
    browser: true,
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    'no-console': 'warn',
  },
  overrides: [
    {
      files: [
        'jest.config.js',
        'webpack.config.js',
        '.prettierrc.js',
        '.eslintrc.js',
      ],
      env: {
        node: true,
      },
      extends: ['plugin:prettier/recommended'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
};

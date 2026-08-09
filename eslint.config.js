const reactPlugin = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');

module.exports = [
  {
    ignores: ['node_modules/**', 'dist/**', 'release/**', 'custom-assets/**', 'tailwind.config.js', 'vite.config.js', 'postcss.config.js'],
  },
  {
    files: ['electron/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { process: 'readonly', __dirname: 'readonly', console: 'readonly', require: 'readonly', module: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly', clearInterval: 'readonly', Buffer: 'readonly' },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  {
    files: ['src/**/*.js', 'src/**/*.jsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { window: 'readonly', document: 'readonly', console: 'readonly', setTimeout: 'readonly', setInterval: 'readonly', clearInterval: 'readonly', clearTimeout: 'readonly', fetch: 'readonly', URL: 'readonly', Audio: 'readonly', localStorage: 'readonly' },
    },
    plugins: { react: reactPlugin, 'react-hooks': reactHooks },
    settings: { react: { version: 'detect' } },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/prop-types': 'off',
      'no-undef': 'error',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
];

let customConfig = [];
let hasIgnoresFile = false;
try {
  require.resolve('./eslint.ignores.cjs');
  hasIgnoresFile = true;
} catch {
  // eslint.ignores.cjs doesn't exist
}

if (hasIgnoresFile) {
  const ignores = require('./eslint.ignores.cjs');
  customConfig = [{ignores}];
}

module.exports = [
  ...customConfig,
  ...require('gts'),
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.node.json']
      }
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off'
    }
  }
];

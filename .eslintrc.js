module.exports = {
  root: true,
  env: {
    node: true,
  },
  plugins: [
    '@typescript-eslint',
    'no-loops'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    'quotes': [2, 'single', { 'avoidEscape': true }],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    'no-underscore-dangle': 'off',
    'class-methods-use-this': 'off',
    'prefer-spread': 'off',
    'eslint-disable-next-line': 'off',
    'max-len': ['warn', { 'code': 140, 'ignoreComments': true, 'ignoreUrls': true }],
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // 'no-plusplus': [2, { allowForLoopAfterthoughts: true }],
    'linebreak-style': 0,
    'global-require': 0,
    'eslint linebreak-style': [0, 'error', 'windows'],
    'no-undef': 'off',
  },
  parser: '@typescript-eslint/parser',
};

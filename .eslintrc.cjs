/*eslint-env shared-node-browser, es2024 */

const ERROR_FORCE_UNIVERSAL_STREAMS =
  'Please use `tc-message-toolkit/stream` alias to ensure browser/node compatibility.'
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest',
  },
  plugins: [
    '@typescript-eslint',
    'eslint-plugin-tsdoc',
    'filename-rules',
    'eslint-plugin-local-rules',
  ],
  root: true,
  rules: {
    /**
     * Override defaults from recommended presets. See
     * https://overreacted.io/writing-resilient-components/#dont-get-distracted-by-imaginary-problems
     * for a summary that matches my thoughts.
     */

    // Best avoided but in specific circumstances may be ok if good reason given and discussed on PR
    '@typescript-eslint/ban-ts-comment': [
      'error',
      {
        'ts-expect-error': 'allow-with-description',
        'ts-ignore': 'allow-with-description',
        'ts-nocheck': 'allow-with-description',
        'ts-check': false,
      },
    ],
    // Trust the developer and PR process
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-extra-non-null-assertion': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off', // Enforced in tsconfig
    'no-constant-condition': 'off',
    'no-useless-escape': 'off', // False positives
    'no-control-regex': 'off', // We need all types of regex

    /** Custom rules for the complexities of this package */
    'no-restricted-globals': [
      'error',
      {
        name: 'ReadableStream',
        message: ERROR_FORCE_UNIVERSAL_STREAMS,
      },
      {
        name: 'TransformStream',
        message: ERROR_FORCE_UNIVERSAL_STREAMS,
      },
    ],

    'local-rules/tsdoc/syntax': 'error',
    'filename-rules/match': ['error', 'kebab-case'],
  },
}

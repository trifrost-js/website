const js = require('@eslint/js');
const tseslint = require('typescript-eslint');

module.exports = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: ['prettier'],
    extends: ['prettier'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    rules: {
      indent: ['error', 2, {SwitchCase: 1}],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'comma-dangle': [
        'error',
        {
          arrays: 'always-multiline',
          objects: 'always-multiline',
          imports: 'always-multiline',
          exports: 'never',
          functions: 'never',
        },
      ],
      'arrow-parens': ['error', 'as-needed'],
      'object-curly-spacing': ['error', 'never'],
      'array-bracket-spacing': ['error', 'never'],
      'space-before-function-paren': ['error', 'always'],
      'prettier/prettier': 'error',
      'no-console': ['error', {allow: ['warn', 'error']}],
      'no-use-before-define': 'error',
      eqeqeq: 'error',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];

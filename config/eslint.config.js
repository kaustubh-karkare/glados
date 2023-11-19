module.exports = {
    env: {
        browser: true,
        es6: true,
        jest: true,
        node: true,
    },
    extends: [
        'plugin:react/recommended',
        'airbnb',
    ],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 11,
        sourceType: 'module',
    },
    plugins: [
        'react',
        'simple-import-sort',
    ],
    settings: {
        react: {
            version: '16.13.1',
        },
    },
    rules: {
        indent: ['error', 4],
        'import/no-cycle': [0],
        // Unable to resolve path to module 'react'
        'import/no-unresolved': [0],
        // Need to add role attribute for accessibility on HTML elements.
        'jsx-a11y/no-static-element-interactions': [0],
        'jsx-a11y/click-events-have-key-events': [0],
        'jsx-a11y/mouse-events-have-key-events': [0],
        'jsx-a11y/anchor-is-valid': [0],
        'jsx-a11y/no-noninteractive-tabindex': [0],
        'no-param-reassign': [0],
        'no-underscore-dangle': [0, 'allowAfterThis'],
        'no-unused-vars': ['error', { args: 'none', varsIgnorePattern: '^_' }],
        'react/jsx-indent': ['error', 4],
        'react/jsx-indent-props': ['error', 4],
        'react/destructuring-assignment': [0],
        'react/jsx-filename-extension': [0],
        'react/jsx-props-no-spreading': [0],
        // Otherwise, every non-required propType would need defaultValue.
        'react/require-default-props': [0],
        'simple-import-sort/imports': 'error',
    },
};

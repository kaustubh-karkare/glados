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
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 11,
        sourceType: 'module',
    },
    plugins: [
        'react',
    ],
    rules: {
        indent: ['error', 4],
        'no-param-reassign': [0],
        'react/jsx-indent': ['error', 4],
        'react/jsx-indent-props': ['error', 4],
        'react/destructuring-assignment': [0],
        'react/jsx-filename-extension': [0],
        'react/jsx-props-no-spreading': [0],
        'react/require-default-props': [0],
    },
    ignorePatterns: [
        'dist/*',
        'src/client/Common/draft-js-mention-plugin/*',
    ],
};

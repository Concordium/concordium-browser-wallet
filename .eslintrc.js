module.exports = {
    parser: '@typescript-eslint/parser',
    extends: ['airbnb', 'airbnb-typescript', 'plugin:prettier/recommended', 'plugin:@typescript-eslint/recommended'],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
        project: 'tsconfig.json',
        createDefaultProgram: true,
    },
    env: {
        browser: true,
        jest: true,
        node: true,
    },
    rules: {
        'import/prefer-default-export': 0,
        'no-restricted-exports': 0,
        'react/jsx-props-no-spreading': 0,
        'react/require-default-props': 0,
        'jsx-a11y/label-has-associated-control': [
            'error',
            {
                required: {
                    some: ['nesting', 'id'],
                },
            },
        ],
    },
};

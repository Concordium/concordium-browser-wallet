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
        'class-methods-use-this': 0,
        'jsx-a11y/no-autofocus': 0,
        'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/*.stories.tsx', '**/build/**/*'] }],
        'jsx-a11y/label-has-associated-control': [
            'error',
            {
                required: {
                    some: ['nesting', 'id'],
                },
            },
        ],
        'prettier/prettier': [
            'error',
            {
                trailingComma: 'es5',
                singleQuote: true,
                printWidth: 120,
                tabWidth: 4,
            },
        ],
    },
};

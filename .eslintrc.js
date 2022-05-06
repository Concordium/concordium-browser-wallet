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
        'class-methods-use-this': 0,
    },
};

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['js', 'ts', 'json'],
    moduleDirectories: ['node_modules'],
    transform: {
        '^.+\\.ts?$': [
            'ts-jest',
            {
                /* ts-jest config goes here in Jest */
            },
        ],
    },
    testTimeout: 10000,
};

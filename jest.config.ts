import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
            '<rootDir>/internals/mocks/fileMock.js',
        '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
        '^@(popup|background|content|inject|shared)/(.*)$': '<rootDir>/packages/browser-wallet/src/$1/$2',
        '^@root/(.*)$': '<rootDir>/packages/browser-wallet/$1',
        '^@concordium/browser-wallet-api(.*)$': '<rootDir>/packages/browser-wallet-api/src$1',
        '^@concordium/browser-wallet-message-hub(.*)$': '<rootDir>/packages/browser-wallet-message-hub/src$1',
    },
};

export default config;

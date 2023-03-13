import { pathsToModuleNameMapper } from 'ts-jest';
import type { Config } from '@jest/types';
import tsconfig from './tsconfig.json';

const config: Config.InitialOptions = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        ...pathsToModuleNameMapper(tsconfig.compilerOptions.paths, { prefix: '<rootDir>/' }),
        '@concordium/web-sdk': '@concordium/common-sdk',
        '^uuid$': 'uuid',
        'wallet-common-helpers': '<rootDir>/../../node_modules/wallet-common-helpers/lib/index.js',
    },
    transformIgnorePatterns: ['/node_modules/(?!@concordium/common-sdk)'],
    modulePaths: ['<rootDir>/../../node_modules', '<rootDir>/node_modules'],
    setupFiles: ['./test/setup.ts'],
};

export default config;

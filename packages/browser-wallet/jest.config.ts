import { pathsToModuleNameMapper } from 'ts-jest';
import type { Config } from '@jest/types';
import tsconfig from './tsconfig.json';

const esModules = ['@concordium/web-sdk', '@concordium/rust-bindings', '@noble/ed25519', 'wallet-common-helpers'].join(
    '|'
);

const config: Config.InitialOptions = {
    preset: 'ts-jest/presets/js-with-ts-esm',
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        ...pathsToModuleNameMapper(tsconfig.compilerOptions.paths, { prefix: '<rootDir>/' }),
        '^uuid$': 'uuid',
    },
    transformIgnorePatterns: [`node_modules/(?!${esModules})`],
    modulePaths: ['<rootDir>/../../node_modules', '<rootDir>/node_modules'],
    setupFiles: ['./test/setup.ts'],
};

export default config;

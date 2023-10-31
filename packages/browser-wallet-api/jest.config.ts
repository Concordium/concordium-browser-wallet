import { pathsToModuleNameMapper } from 'ts-jest';
import type { Config } from '@jest/types';
import tsconfig from './tsconfig.json';

const esModules = [].join('|');

const config: Config.InitialOptions = {
    preset: 'ts-jest/presets/js-with-ts-esm',
    moduleNameMapper: {
        ...pathsToModuleNameMapper(tsconfig.compilerOptions.paths, { prefix: '<rootDir>/' }),
    },
    transformIgnorePatterns: [`node_modules/(?!${esModules})`],
    modulePaths: ['<rootDir>/../../node_modules', '<rootDir>/node_modules'],
};

export default config;

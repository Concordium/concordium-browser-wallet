import { pathsToModuleNameMapper } from 'ts-jest';
import type { Config } from '@jest/types';
import tsconfig from './tsconfig.json';

const config: Config.InitialOptions = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths, { prefix: '<rootDir>/' }),
};

export default config;

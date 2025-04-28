import { getVersionName, isDevelopmentBuild, isProductionBuild } from '../src/shared/utils/environment-helpers';
import packageJson from '../package.json';

const OLD_ENV = process.env;

beforeEach(() => {
    process.env = { ...OLD_ENV };
});

afterAll(() => {
    process.env = OLD_ENV;
});

test('isProductionBuild is true when production environment', () => {
    process.env.NODE_ENV = 'production';

    expect(isProductionBuild()).toBeTruthy();
});

test('isDevelopmentBuild is false when production environment', () => {
    process.env.NODE_ENV = 'production';

    expect(isDevelopmentBuild()).toBeFalsy();
});

test('isDevelopmentBuild is true when not production environment', () => {
    process.env.NODE_ENV = 'development';

    expect(isDevelopmentBuild()).toBeTruthy();
});

test('isProductionBuild is false when not production environment', () => {
    process.env.NODE_ENV = 'development';

    expect(isProductionBuild()).toBeFalsy();
});

test('getVersionName includes -dev when development', () => {
    process.env.NODE_ENV = 'development';

    expect(getVersionName()).toEqual(`${packageJson.version}-dev`);
});

test('getVersionName is just package version when production', () => {
    process.env.NODE_ENV = 'production';

    expect(getVersionName()).toEqual(packageJson.version);
});

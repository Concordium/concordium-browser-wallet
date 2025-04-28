import packageJson from '../../../package.json';

export function isProductionBuild() {
    return process.env.NODE_ENV === 'production';
}

export function isDevelopmentBuild() {
    return !isProductionBuild();
}

export function getVersionName() {
    return packageJson.version + (isDevelopmentBuild() ? '-dev' : '');
}

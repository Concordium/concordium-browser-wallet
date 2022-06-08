/* eslint-disable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires, no-param-reassign */
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
    core: {
        builder: {
            name: 'webpack5',
            // options: {
            //     lazyCompilation: true,
            //     fsCache: true,
            // },
        },
    },
    stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: [
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        '@storybook/addon-interactions',
        '@storybook/preset-scss',
    ],
    framework: '@storybook/react',
    webpackFinal: async (config) => {
        config.resolve.plugins = [new TsconfigPathsPlugin()];
        return config;
    },
};

/* eslint-disable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires, no-param-reassign */
const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const pathToSvgAssets = path.resolve(__dirname, '../src/shared/assets/svg');

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
        const { rules } = config.module;

        const fileLoaderRule = rules.find((rule) => rule.test.test('.svg'));
        fileLoaderRule.exclude = pathToSvgAssets;

        rules.push({
            test: /\.svg$/,
            include: pathToSvgAssets,
            use: ['@svgr/webpack'],
        });

        config.resolve.plugins = [new TsconfigPathsPlugin()];

        return config;
    },
};

import { dirname, join } from 'path';
/* eslint-disable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires, no-param-reassign */
const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const pathToSvgAssets = path.resolve(__dirname, '../src/assets/svg');

module.exports = {
    stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
    staticDirs: [{ from: '../src/assets', to: '/assets' }],

    addons: [
        getAbsolutePath('@storybook/addon-links'),
        getAbsolutePath('@storybook/addon-essentials'),
        getAbsolutePath('@storybook/addon-interactions'),
        getAbsolutePath('@storybook/preset-scss'),
        getAbsolutePath('@storybook/addon-webpack5-compiler-swc'),
        getAbsolutePath('@storybook/addon-viewport'),
    ],

    framework: {
        name: getAbsolutePath('@storybook/react-webpack5'),
        options: {},
    },

    core: {
        disableTelemetry: true,
    },

    webpackFinal: async (config) => {
        const { rules } = config.module;

        const fileLoaderRule = rules.find((rule) => rule.test.test('.svg'));
        fileLoaderRule.exclude = pathToSvgAssets;

        rules.push({
            test: /\.svg$/,
            include: pathToSvgAssets,
            use: [
                {
                    loader: '@svgr/webpack',
                    options: {
                        svgoConfig: {
                            plugins: [
                                {
                                    name: 'removeViewBox',
                                    active: false,
                                },
                            ],
                        },
                    },
                },
            ],
        });

        config.resolve.plugins = [new TsconfigPathsPlugin()];

        return config;
    },

    babel: async (options) => {
        return {
            ...options,
            plugins: options.plugins.filter((x) => !(typeof x === 'string' && x.includes('plugin-transform-classes'))),
        };
    },

    docs: {},

    typescript: {
        reactDocgen: 'react-docgen-typescript',
    },
};

function getAbsolutePath(value) {
    return dirname(require.resolve(join(value, 'package.json')));
}

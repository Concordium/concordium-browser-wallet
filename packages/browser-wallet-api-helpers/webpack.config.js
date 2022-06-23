/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'production',
    entry: {
        concordiumHelpers: './lib/index.js',
    },
    plugins: [
        new webpack.SourceMapDevToolPlugin({
            filename: '[file].map',
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
    ],
    module: {
        rules: [
            {
                test: /\.m?js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            [
                                '@babel/preset-env',
                                {
                                    useBuiltIns: 'entry',
                                    corejs: 3,
                                    targets: {
                                        chrome: 67,
                                    },
                                },
                            ],
                        ],
                        plugins: ['@babel/plugin-transform-runtime', '@babel/plugin-transform-modules-commonjs'],
                    },
                },
            },
        ],
    },
    output: {
        filename: '[name].min.js',
        path: path.resolve(__dirname, 'lib'),
        library: 'concordiumHelpers',
        libraryTarget: 'umd',
        publicPath: '',
    },
};

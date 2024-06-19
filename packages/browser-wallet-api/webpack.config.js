/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const webpack = require('webpack');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = {
    mode: 'production',
    entry: {
        concordiumWalletApi: './lib/browser-wallet-api/src/index.js',
    },
    plugins: [
        new webpack.SourceMapDevToolPlugin({
            filename: '[file].map',
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
        new NodePolyfillPlugin()
    ],
    stats: {
        errorDetails: true,
    },
    module: {
        rules: [
            {
                test: /\.m?(js|ts)$/,
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
                        plugins: [
                            '@babel/plugin-transform-runtime',
                            ['@babel/plugin-transform-modules-commonjs',{lazy:true}],
                            '@babel/plugin-transform-class-properties',
                            '@babel/plugin-syntax-typescript',
                            '@babel/plugin-transform-typescript'
                        ],
                    },
                },
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.ts']
    },
    output: {
        filename: '[name].min.js',
        path: path.resolve(__dirname, 'lib'),
        library: 'concordiumWalletApi',
        libraryTarget: 'umd',
        publicPath: '',
    },
};

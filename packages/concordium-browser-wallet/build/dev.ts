/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
import esbuild, { BuildOptions } from 'esbuild';
import { htmlPlugin } from '@craftamap/esbuild-plugin-html';
import { sassPlugin } from 'esbuild-sass-plugin';
import path from 'path';
import fs from 'fs';
import { root } from './utils';

const watch = Boolean(process.env.WATCH);

const popup = 'src/popup/index.tsx';
const background = 'src/background/index.ts';
const content = 'src/content/index.ts';
const htmlTemplate = fs.readFileSync('src/popup/index.html').toString();

const config: BuildOptions = {
    entryPoints: [popup, background, content],
    outbase: 'src',
    entryNames: '[dir]-[hash]',
    bundle: true,
    minify: true,
    metafile: true,
    logLevel: 'info',
    sourcemap: process.env.NODE_ENV !== 'production',
    target: ['chrome58', 'firefox57'],
    outdir: path.resolve(root, './dist'),
    define: {
        'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
    },
    plugins: [
        sassPlugin(),
        htmlPlugin({
            files: [
                {
                    entryPoints: [popup],
                    filename: 'popup.html',
                    htmlTemplate,
                },
            ],
        }),
    ],
};

if (watch) {
    config.watch = {
        onRebuild(error, result) {
            if (error) {
                console.error('watch build failed:', error);
                return;
            }

            console.log('rebuild success:', result);
        },
    };
}

esbuild
    .build(config)
    .then(() => {
        if (watch) {
            console.log('watching for changes...');
        }
    })
    .catch(() => process.exit(1));

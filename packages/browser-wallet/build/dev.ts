/* eslint-disable no-console */
import esbuild, { BuildOptions } from 'esbuild';
import { htmlPlugin } from '@craftamap/esbuild-plugin-html';
import { sassPlugin } from 'esbuild-sass-plugin';
import svgrPlugin from 'esbuild-plugin-svgr';
import { copy } from 'esbuild-plugin-copy';
import fs from 'fs';
import { manifestPlugin } from './plugins/chrome-extension-manifest-v3';

const watch = Boolean(process.env.WATCH);

const popup = 'src/popup/index.tsx';
const background = 'src/background/index.ts';
const content = 'src/content/index.ts';
const inject = 'src/inject/index.ts';

const popupHtmlTemplate = fs.readFileSync('src/popup/index.html').toString();
const popupHtmlOut = 'popup.html';

const manifestTemplate = fs.readFileSync('manifest.json').toString();

const config: BuildOptions = {
    entryPoints: [popup, background, content, inject],
    outbase: 'src',
    entryNames: '[dir]',
    bundle: true,
    minify: true,
    metafile: true,
    logLevel: 'info',
    sourcemap: process.env.NODE_ENV !== 'production' && 'inline',
    target: ['chrome67'],
    outdir: 'dist',
    define: {
        'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
        global: 'window',
        'document.baseURI': '""',
    },
    loader: { '.jpg': 'dataurl', '.png': 'dataurl' },
    plugins: [
        svgrPlugin(),
        sassPlugin(),
        htmlPlugin({
            files: [
                {
                    entryPoints: [popup],
                    filename: popupHtmlOut,
                    htmlTemplate: popupHtmlTemplate,
                },
            ],
        }),
        manifestPlugin({ manifestTemplate, popupHtmlFile: popupHtmlOut }),
        copy({
            assets: {
                from: ['./resources/**/*'],
                to: ['./resources/'],
                keepStructure: true,
            },
        }),
    ],
};

if (watch) {
    config.watch = {
        onRebuild(error) {
            if (error) {
                console.error('watch build failed:', error);
                return;
            }

            console.log('rebuild successful');
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

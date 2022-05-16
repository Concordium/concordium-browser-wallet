/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
import esbuild, { BuildOptions } from 'esbuild';
import { htmlPlugin } from '@craftamap/esbuild-plugin-html';
import { sassPlugin } from 'esbuild-sass-plugin';
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
    sourcemap: process.env.NODE_ENV !== 'production',
    target: ['chrome67'],
    outdir: 'dist',
    define: {
        'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
    },
    plugins: [
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

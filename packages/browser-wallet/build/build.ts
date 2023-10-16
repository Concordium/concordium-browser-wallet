/* eslint-disable no-console */
import esbuild, { BuildOptions, PluginBuild } from 'esbuild';
import { htmlPlugin } from '@craftamap/esbuild-plugin-html';
import { sassPlugin } from 'esbuild-sass-plugin';
import svgrPlugin from 'esbuild-plugin-svgr';
import { copy } from 'esbuild-plugin-copy';
import fs from 'fs';
import { manifestPlugin } from './plugins/chrome-extension-manifest-v3';
import { isDevelopmentBuild } from '../src/shared/utils/environment-helpers';

const watch = Boolean(process.env.WATCH);

const popup = 'src/popup/index.tsx';
const background = 'src/background/index.ts';
const content = 'src/content/index.ts';
const inject = 'src/inject/index.ts';

const popupHtmlTemplate = fs.readFileSync('src/popup/index.html').toString();
const popupHtmlOut = 'popup.html';

const manifestTemplate = fs.readFileSync('manifest.json').toString();

const streamPlugin = {
    name: 'stream',
    setup: (build: PluginBuild) => {
        build.onResolve({ filter: /^stream$/ }, () => ({ path: require.resolve('readable-stream') }));
    },
};

const config: BuildOptions = {
    entryPoints: [popup, background, content, inject],
    outbase: 'src',
    entryNames: '[dir]',
    bundle: true,
    minify: true,
    metafile: true,
    logLevel: 'info',
    sourcemap: isDevelopmentBuild() && 'inline',
    target: ['chrome67'],
    outdir: 'dist',
    define: {
        'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
        'process.env.READABLE_STREAM': '""',
        global: 'window',
        // Without this the web-sdk is unable to be used in a web-worker. (Throws because document is undefined)
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
            assets: [
                {
                    from: ['./resources/**/*'],
                    to: ['./resources/'],
                    keepStructure: true,
                },
                {
                    from: ['./src/assets/svg/**/*'],
                    to: ['./assets/svg'],
                    keepStructure: true,
                },
            ],
        }),
        streamPlugin,
    ],
};

(async () => {
    if (watch) {
        const ctx = await esbuild.context(config);
        await ctx.watch();
        console.log('watching for changes...');
    } else {
        esbuild.build(config).catch(() => process.exit(1));
    }
})();

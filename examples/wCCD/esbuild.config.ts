/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
import esbuild, { BuildOptions } from 'esbuild';
import { htmlPlugin } from '@craftamap/esbuild-plugin-html';
import svgrPlugin from 'esbuild-plugin-svgr';
import fs from 'fs';

const watch = Boolean(process.env.WATCH);

const main = 'src/index.tsx';

const htmlTemplate = fs.readFileSync('src/index.html').toString();
const htmlOut = 'index.html';

if (process.env.NETWORK === undefined || (process.env.NETWORK !== 'testnet' && process.env.NETWORK !== 'mainnet')) {
    throw Error('Environmental variable NETWORK needs to be defined and set to either "mainnet" or "testnet"');
}

const config: BuildOptions = {
    entryPoints: [main],
    entryNames: '[name]',
    bundle: true,
    minify: true,
    metafile: true,
    logLevel: 'info',
    sourcemap: 'inline',
    target: ['chrome67'],
    outdir: 'dist',
    define: {
        global: 'window',
        'process.env.NETWORK': process.env.NETWORK,
    },
    plugins: [
        htmlPlugin({
            files: [
                {
                    entryPoints: [main],
                    filename: htmlOut,
                    htmlTemplate,
                },
            ],
        }),
        svgrPlugin(),
    ],
    // https://github.com/evanw/esbuild/issues/73#issuecomment-1204706295
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

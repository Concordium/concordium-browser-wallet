/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
import esbuild, { BuildOptions } from 'esbuild';
import { copy } from 'esbuild-plugin-copy';
import svgrPlugin from 'esbuild-plugin-svgr';

const watch = Boolean(process.env.WATCH);

const main = 'src/index.js';

const config: BuildOptions = {
    entryPoints: [main],
    entryNames: '[name]',
    bundle: true,
    minify: true,
    metafile: true,
    logLevel: 'info',
    loader: { '.js': 'jsx' },
    sourcemap: 'inline',
    target: ['chrome67'],
    outdir: 'dist/public',
    plugins: [
        copy({
            assets: {
                from: ['./public/**/*'],
                to: ['../'],
                keepStructure: true,
            },
        }),
        svgrPlugin(),
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

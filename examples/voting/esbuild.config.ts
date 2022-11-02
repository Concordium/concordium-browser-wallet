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
    loader: { '.js': 'jsx'},
    sourcemap: 'inline',
    target: ['chrome67'],
    outdir: 'dist',
    plugins: [
        copy({
            assets: {
                from: ['./public/**/*'],
                to: ['./'],
                keepStructure: true,
            },
        }),
        svgrPlugin(),
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

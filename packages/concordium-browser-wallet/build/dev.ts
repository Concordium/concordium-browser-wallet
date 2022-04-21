/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
import esbuild, { BuildOptions } from 'esbuild';
import path from 'path';
import { root } from './utils';

const watch = Boolean(process.env.WATCH);

const config: BuildOptions = {
    entryPoints: [
        // "./src/background.ts",
        // "./src/content.ts",
        path.resolve(root, './src/popup.tsx'),
        // "./src/injected.ts"
    ],
    bundle: true,
    minify: true,
    sourcemap: process.env.NODE_ENV !== 'production',
    target: ['chrome58', 'firefox57'],
    outdir: path.resolve(root, './dist'),
    define: {
        'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
    },
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

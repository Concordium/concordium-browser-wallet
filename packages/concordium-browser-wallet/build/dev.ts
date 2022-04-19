/* eslint-disable import/no-extraneous-dependencies */
import esbuild from 'esbuild';
import path from 'path';

const root = process.cwd();
const watch = Boolean(process.env.WATCH);

esbuild
    .build({
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
        watch,
    })
    .catch(() => process.exit(1));

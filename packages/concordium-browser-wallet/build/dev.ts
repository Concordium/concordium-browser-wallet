import esbuild from 'esbuild';
import path from 'path';

const root = process.cwd();

esbuild
    .build({
        entryPoints: [
            // "./src/background.ts",
            // "./src/content.ts",
            path.resolve(root, "./src/popup.tsx"),
            // "./src/injected.ts"
        ],
        bundle: true,
        minify: true,
        sourcemap: process.env.NODE_ENV !== "production",
        target: ["chrome58", "firefox57"],
        outdir: path.resolve(root, "./dist"),
        define: {
            "process.env.NODE_ENV": `"${process.env.NODE_ENV}"`
        }
    })
    .catch(() => process.exit(1));

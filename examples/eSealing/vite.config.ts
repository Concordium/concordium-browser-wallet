import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
    plugins: [
        react(),
        svgr(),
        wasm(),
        topLevelAwait(), // For legacy browser compatibility
    ],
    build: {
        rollupOptions: {
            plugins: [nodePolyfills()],
        },
    },
    resolve: {
        alias: {
            '@concordium/rust-bindings': '@concordium/rust-bindings/bundler', // Resolve bundler-specific wasm entrypoints.
            stream: 'rollup-plugin-node-polyfills/polyfills/stream',
        },
    },
});

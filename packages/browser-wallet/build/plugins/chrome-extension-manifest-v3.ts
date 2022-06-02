/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
import esbuild from 'esbuild';
import path from 'path';
import { promises as fs } from 'fs';

import packageJson from 'package.json';
import { throwIfUndefined } from '@shared/utils/function-helpers';

export type Configuration = {
    /**
     * Template for manifest.json file, with placeholders for adding references built from entrypoints.
     */
    manifestTemplate: string;
    /**
     * Path to popup HTML file to include in manifest. Should be relative to outdir root.
     */
    popupHtmlFile: string;
};

/**
 * Plugin for building chrome extension v3 manifest.
 *
 * Replaces entry points marked with entryPoint!<path> with respective output bundle
 * Replaces placeholder for popup HTML file marked with "popupHtmlFile!" with the provided path to the final popup (relative to outdir root).
 */
export const manifestPlugin = ({ manifestTemplate, popupHtmlFile }: Configuration): esbuild.Plugin => ({
    name: 'chrome-extension-manifest-v3-plugin',
    setup(build) {
        if (!build.initialOptions.metafile) {
            throw new Error('metafile is not enabled');
        }
        if (!build.initialOptions.outdir) {
            throw new Error('outdir must be set');
        }

        const { outdir } = build.initialOptions;

        const log: typeof console.log = (...args) =>
            ['info', 'debug'].includes(build.initialOptions.logLevel ?? '') && console.log(...args);

        const findOutFile = (metafile: esbuild.Metafile, entryPoint: string) =>
            Object.entries(metafile.outputs)
                .find(([, value]) => value.entryPoint === entryPoint)?.[0]
                ?.replace(`${outdir}/`, '');
        const findOutFileSafe = throwIfUndefined(
            findOutFile,
            (_, e) => `Could not find bundle file for entrypoint ${e}`
        );

        const replaceManifestPlaceholders = (metafile: esbuild.Metafile) =>
            manifestTemplate
                .replace(/"entryPoint!(.+)"/g, (_, p1) => `"${findOutFileSafe(metafile, p1)}"`)
                .replace('popupHtmlFile!', popupHtmlFile);

        build.onEnd(async (res) => {
            const startTime = Date.now();

            if (!res.metafile) {
                throw new Error('Expected metafile to be present in build result.');
            }

            const replaced = replaceManifestPlaceholders(res.metafile);
            const manifest = JSON.parse(replaced);

            // Use package information from package.json
            manifest.version = packageJson.version;
            manifest.description = packageJson.description;
            manifest.author = packageJson.author;

            const content = JSON.stringify(manifest);
            const out = path.join(outdir, 'manifest.json');
            await fs.writeFile(out, content);
            const { size } = await fs.stat(out);

            log(`  ${out} - ${size}`);
            log(`  Manifest plugin done in ${Date.now() - startTime}ms`);
        });
    },
});

/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
import esbuild from 'esbuild';
import path from 'path';
import { promises as fs } from 'fs';

import packageJson from '@root/package.json';
import { throwIfUndefined } from '@root/utils/functionHelpers';

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

        const { outdir, entryPoints } = build.initialOptions;

        const findOutFile = (metafile: esbuild.Metafile, entryPoint: string) =>
            Object.entries(metafile.outputs)
                .find(([, value]) => value.entryPoint === entryPoint)?.[0]
                ?.replace(`${outdir}/`, '');
        const findOutFileSafe = throwIfUndefined(
            findOutFile,
            (_, e) => `Could not find bundle file for entrypoint ${e}`
        );

        const eps = Array.isArray(entryPoints) ? entryPoints : Object.values(entryPoints ?? {});

        const replaceManifestPlaceholders = (metafile: esbuild.Metafile) =>
            eps
                .reduce((acc, e) => acc.replace(`entryPoint!${e}`, findOutFileSafe(metafile, e)), manifestTemplate)
                .replace('popupHtmlFile!', popupHtmlFile);

        build.onEnd(async (res) => {
            if (!res.metafile) {
                throw new Error('Expected metafile to be present in build result.');
            }

            const manifest = JSON.parse(replaceManifestPlaceholders(res.metafile));

            // Use package information from package.json
            manifest.version = packageJson.version;
            manifest.description = packageJson.description;
            manifest.author = packageJson.author;

            const content = JSON.stringify(manifest);
            const out = path.join(outdir, 'manifest.json');
            await fs.writeFile(out, content);
        });
    },
});

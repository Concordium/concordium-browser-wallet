/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
import esbuild from 'esbuild';
import path from 'path';
import { promises as fs } from 'fs';
import packageJson from '@root/package.json';
import { throwIfUndefined } from '@root/utils/functionHelpers';

export type Configuration = {
    manifestTemplate: string;
    popupHtmlFile: string;
    entryPoints?: string[];
};

export const manifestPlugin = ({
    manifestTemplate,
    popupHtmlFile,
    entryPoints = [],
}: Configuration): esbuild.Plugin => ({
    name: 'chrome-extension-manifest-v3-plugin',
    setup(build) {
        if (!build.initialOptions.metafile) {
            throw new Error('metafile is not enabled');
        }
        if (!build.initialOptions.outdir) {
            throw new Error('outdir must be set');
        }

        const { outdir } = build.initialOptions;

        const findOutFile = (metafile: esbuild.Metafile, entryPoint: string) =>
            Object.entries(metafile.outputs)
                .find(([, value]) => value.entryPoint === entryPoint)?.[0]
                ?.replace(`${outdir}/`, '');
        const findOutFileSafe = throwIfUndefined(
            findOutFile,
            (_, e) => `Could not find bundle file for entrypoint ${e}`
        );

        const replaceManifestPlaceholders = (metafile: esbuild.Metafile) =>
            entryPoints
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

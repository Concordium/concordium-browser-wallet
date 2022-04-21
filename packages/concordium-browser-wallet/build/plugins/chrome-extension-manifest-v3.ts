/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
import esbuild from 'esbuild';
import path from 'path';
import { promises as fs } from 'fs';
import packageJson from '../../package.json';

const findOutFile = (outdir: string, metafile: esbuild.Metafile) => (entryPoint: string) =>
    Object.entries(metafile.outputs)
        .find(([, value]) => value.entryPoint === entryPoint)?.[0]
        ?.replace(`${outdir}/`, '');

export type Configuration = {
    manifestTemplate: string;
    popupHtmlFile: string;
    entryPoints?: string[];
};

export const manifestPlugin = ({
    manifestTemplate,
    popupHtmlFile,
    entryPoints = [],
}: Configuration): esbuild.Plugin => {
    return {
        name: 'chrome-extension-manifest-v3-plugin',
        setup(build) {
            build.onStart(() => {
                if (!build.initialOptions.metafile) {
                    throw new Error('metafile is not enabled');
                }
                if (!build.initialOptions.outdir) {
                    throw new Error('outdir must be set');
                }
            });

            build.onEnd(async (res) => {
                const { outdir } = build.initialOptions;

                if (!res.metafile) {
                    return;
                }
                if (!outdir) {
                    return;
                }
                const findFile = findOutFile(outdir, res.metafile);

                const t = entryPoints.reduce((acc, e) => acc.replace(e, findFile(e) as string), manifestTemplate);
                const manifest = JSON.parse(t);

                manifest.version = packageJson.version;
                manifest.description = packageJson.description;
                manifest.author = packageJson.author;

                manifest.action = manifest.action ?? {};
                manifest.action.default_popup = popupHtmlFile;

                const content = JSON.stringify(manifest);
                const out = path.join(outdir, 'manifest.json');
                await fs.writeFile(out, content);
            });
        },
    };
};

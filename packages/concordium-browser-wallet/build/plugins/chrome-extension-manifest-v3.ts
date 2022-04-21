/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
import esbuild from 'esbuild';
import path from 'path';
import { promises as fs } from 'fs';
import packageJson from '../../package.json';

export type Configuration = {
    manifestTemplate: string;
    popupHtmlFile: string;
    backgroundScriptEntryPoint: string;
};

export const manifestPlugin = ({
    manifestTemplate,
    popupHtmlFile,
    backgroundScriptEntryPoint,
}: Configuration): esbuild.Plugin => {
    const manifest = JSON.parse(manifestTemplate);

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

                const backgroundScript = Object.entries(res.metafile.outputs)
                    .find(([, value]) => value.entryPoint === backgroundScriptEntryPoint)?.[0]
                    ?.replace(`${outdir}/`, '');

                manifest.version = packageJson.version;
                manifest.description = packageJson.description;
                manifest.author = packageJson.author;

                manifest.action = manifest.action ?? {};
                manifest.action.default_popup = popupHtmlFile;

                manifest.background = manifest.background ?? {};
                manifest.background.service_worker = backgroundScript;

                const content = JSON.stringify(manifest);
                const out = path.join(outdir, 'manifest.json');
                await fs.writeFile(out, content);
            });
        },
    };
};

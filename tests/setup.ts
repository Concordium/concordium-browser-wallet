import { test as base, chromium, type BrowserContext } from '@playwright/test';
import * as path from 'node:path';
import * as os from 'node:os';
import * as fs from 'node:fs';

const pathToExtension = path.join(__dirname, '../packages/browser-wallet/dist');

type NewTestArgs = {
    context: BrowserContext;
    extensionId: string;
};

/** */
export function setup(userDataDir?: string) {
    const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'bw-test-data-'));
    console.info('tmpdir', tmpdir);
    if (userDataDir !== undefined) {
        fs.cpSync(userDataDir, tmpdir, { recursive: true });
    }
    return base.extend<NewTestArgs>({
        context: async ({}, use) => {
            const context = await chromium.launchPersistentContext(tmpdir, {
                headless: false,
                args: [
                    //`--headless=new`,
                    `--disable-extensions-except=${pathToExtension}`,
                    `--load-extension=${pathToExtension}`,
                ],
            });
            await use(context);
            await context.close();
        },
        extensionId: async ({ context }, use) => {
            // for manifest v3:
            let [background] = context.serviceWorkers();
            if (!background) background = await context.waitForEvent('serviceworker');

            const extensionId = background.url().split('/')[2];
            await use(extensionId);
        },
    });
}

import { setup } from './setup';
import * as Path from 'node:path';

const dataDir = Path.join(__dirname, './data');
const test = setup(dataDir);
const expect = test.expect;

test.beforeEach(async ({ page, extensionId }) => {
    // Unlock the wallet
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.getByLabel('Enter passcode').fill('secret-password');
    await page.getByRole('button', { name: 'Unlock' }).click();
});

test('wCCD', async ({ page }) => {
    // Open Dapp
    await page.goto('https://wccd.testnet.concordium.com/');

    // Connect
    await page.getByRole('button', { name: 'Use Browser Wallet' }).click();
    const [, popupPage] = await Promise.all([
        page.getByRole('button', { name: 'Connect Browser Wallet' }).click(),
        // Await extension popup
        page.context().waitForEvent('page'),
    ]);

    await popupPage.getByRole('button', { name: 'Connect' }).click();

    await page.pause();
});

test('Select ID provider page testnet', async ({ page }) => {
    // Navigate to creating new identity
    await page.getByRole('banner').getByRole('button').first().click();
    await page.getByRole('link', { name: 'ID cards' }).click();
    await page.getByLabel('ID cards').click();
    await page.getByRole('button', { name: 'Request new' }).click();

    // Validate the list of ID providers
    await expect(page.getByRole('main')).toHaveScreenshot();
});

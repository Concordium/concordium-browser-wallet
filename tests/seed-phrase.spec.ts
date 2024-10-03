import { setup } from './setup';

const test = setup();
const { expect } = test;

test('Setup new seed phrase', async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/popup.html`);

    // Terms and conditions page
    await page.getByRole('checkbox', { name: 'I have read and agree to the' }).check();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Passcode setup page
    await page.getByLabel('Enter passcode', { exact: true }).fill('secret-password');
    await page.getByLabel('Enter passcode again').fill('secret-password');
    await page.getByRole('button', { name: 'Continue' }).click();

    // Create or restore seed phrase page
    await page.getByRole('button', { name: 'Create' }).click();

    // Get the generated seed phrase
    const seedphrase = await page.getByRole('textbox').textContent();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Insert the generated seed phrase
    await expect(typeof seedphrase).toBe('string');
    await page.getByRole('textbox').fill(seedphrase!);
    await page.getByRole('button', { name: 'Continue' }).click();

    // Choosing network page
    await page.getByRole('button', { name: 'Concordium Testnet' }).click();

    await page.pause();
});

test('Restore from seed phrase', async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/popup.html`);

    // Terms and conditions page
    await page.getByRole('checkbox', { name: 'I have read and agree to the' }).check();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Passcode setup page
    await page.getByLabel('Enter passcode', { exact: true }).fill('secret-password');
    await page.getByLabel('Enter passcode again').fill('secret-password');
    await page.getByRole('button', { name: 'Continue' }).click();

    // Create or restore seed phrase page
    await page.getByRole('button', { name: 'Restore' }).click();
    const seedPhrase =
        'agree depth crystal canyon twelve doctor false glance spawn lesson deal season february keep leaf lesson brisk used trouble peace wonder order resist remind';
    await page.getByRole('textbox').fill(seedPhrase);
    await page.getByRole('button', { name: 'Continue' }).click();

    // Network to restore from
    await page.getByRole('button', { name: 'Concordium Testnet' }).click();

    // Extend the test timeout
    test.setTimeout(600000);
    await page.waitForTimeout(600000);

    await page.pause();
});

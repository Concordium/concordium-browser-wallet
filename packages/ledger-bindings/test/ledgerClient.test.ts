import {
    AccountAddress,
    AccountTransaction,
    AccountTransactionType,
    CcdAmount,
    TransactionExpiry,
    UpdateContractPayload,
} from '@concordium/common-sdk';
import { Buffer } from 'buffer/';
import ConcordiumLedgerClient from '../src/ledger/ConcordiumLedgerClient';
import { getAccountPath } from '../src/ledger/Path';
import { setupZemu, signTransactionWithSeedPhrase } from './setup';

test(
    'signTransfer successful',
    setupZemu(async (sim, transport) => {
        const header = {
            sender: new AccountAddress('4inf4g36xDEQmjxDbbkqeHD2HNg9v7dohXUDH5S9en4Th53kxm'),
            nonce: BigInt('1'),
            expiry: TransactionExpiry.fromEpochSeconds(BigInt('1'), true),
        };
        const payload = {
            toAddress: new AccountAddress('4inf4g36xDEQmjxDbbkqeHD2HNg9v7dohXUDH5S9en4Th53kxm'),
            amount: new CcdAmount(BigInt('1')),
        };
        const transfer: AccountTransaction = { header, type: AccountTransactionType.Transfer, payload };
        const rawPath = { accountIndex: 0, identityIndex: 0, identityProviderIndex: 0 };
        const path = getAccountPath(rawPath, 'Testnet');
        const expectedSignature = await signTransactionWithSeedPhrase(transfer, rawPath, 'Testnet');

        const client = new ConcordiumLedgerClient(transport);
        const signature = client.signAccountTransaction(transfer, path);
        await sim.waitUntilScreenIsNot(sim.getMainMenuSnapshot());
        for (let i = 0; i < 12; i += 1) {
            await sim.clickRight();
        }
        sim.clickBoth();
        await expect(signature).resolves.toEqual(Buffer.from(expectedSignature, 'hex'));
    })
);

test(
    'updateContract successful',
    setupZemu(async (sim, transport) => {
        const header = {
            sender: new AccountAddress('4inf4g36xDEQmjxDbbkqeHD2HNg9v7dohXUDH5S9en4Th53kxm'),
            nonce: BigInt('1'),
            expiry: TransactionExpiry.fromEpochSeconds(BigInt('1'), true),
        };
        const payload: UpdateContractPayload = {
            amount: new CcdAmount(BigInt('1')),
            address: {
                index: 1n,
                subindex: 1n,
            },
            receiveName: 'testContract',
            /** Parameters for the update function */
            message: Buffer.from('1234', 'hex'),
            maxContractExecutionEnergy: 1n,
        };
        const update: AccountTransaction = { header, type: AccountTransactionType.Update, payload };
        const rawPath = { accountIndex: 0, identityIndex: 0, identityProviderIndex: 0 };
        const path = getAccountPath(rawPath, 'Testnet');
        const expectedSignature = await signTransactionWithSeedPhrase(update, rawPath, 'Testnet');

        const client = new ConcordiumLedgerClient(transport);
        const signature = client.signAccountTransaction(update, path);
        await sim.waitUntilScreenIsNot(sim.getMainMenuSnapshot());
        for (let i = 0; i < 10; i += 1) {
            await sim.clickRight();
        }
        await sim.clickBoth();
        await sim.clickRight();
        sim.clickBoth();
        await expect(signature).resolves.toEqual(Buffer.from(expectedSignature, 'hex'));
    })
);

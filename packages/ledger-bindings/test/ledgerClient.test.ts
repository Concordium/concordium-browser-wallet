import {
    AccountAddress,
    AccountTransaction,
    AccountTransactionType,
    CcdAmount,
    TransactionExpiry,
} from '@concordium/common-sdk';
import { Buffer } from 'buffer/';
import ConcordiumLedgerClient from '../src/ledger/ConcordiumLedgerClient';
import { getAccountPath } from '../src/ledger/Path';
import { setupZemu } from './setup';

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
        const path = getAccountPath({ accountIndex: 0, identityIndex: 0, identityProviderIndex: 0 }, 'Testnet');
        const expectedSignature =
            '5dca40d629ba51bf3cc13b36dd62d618dd54d6b714f6f797fdfe1924297b747db7778846faf70a1f4c62a7e9d81d3ad08a336f56c95520120cefaa981af35b08';

        const client = new ConcordiumLedgerClient(transport);
        const signature = client.signTransfer(transfer, path);
        await sim.waitUntilScreenIsNot(sim.getMainMenuSnapshot());
        for (let i = 0; i < 12; i += 1) {
            await sim.clickRight();
        }
        sim.clickBoth();
        await expect(signature).resolves.toEqual(Buffer.from(expectedSignature, 'hex'));
    })
);

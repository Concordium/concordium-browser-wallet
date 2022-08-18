/* eslint-disable no-console */
import { createContext } from 'react';
import { detectConcordiumProvider } from '@concordium/browser-wallet-api-helpers';
import { AccountTransactionType, GtuAmount, UpdateContractPayload } from '@concordium/web-sdk';

export const CONTRACT_NAME = 'PiggyBank';

/**
 * Action for depositing an amount of microCCD to the piggy bank instance
 */
export const deposit = (account: string, index: bigint, subindex = 0n, amount = 0) => {
    if (!Number.isInteger(amount) || amount <= 0) {
        return;
    }

    detectConcordiumProvider()
        .then((provider) => {
            provider
                .sendTransaction(account, AccountTransactionType.UpdateSmartContractInstance, {
                    amount: new GtuAmount(BigInt(amount)),
                    contractAddress: {
                        index,
                        subindex,
                    },
                    receiveName: `${CONTRACT_NAME}.insert`,
                    maxContractExecutionEnergy: 30000n,
                } as UpdateContractPayload)
                .then((txHash) =>
                    console.log(`https://testnet.ccdscan.io/?dcount=1&dentity=transaction&dhash=${txHash}`)
                )
                .catch(alert);
        })
        .catch(() => {
            throw new Error('Concordium Wallet API not accessible');
        });
};

/**
 * Action for smashing the piggy bank. This is only possible to do, if the account sending the transaction matches the owner of the piggy bank:
 * https://github.com/Concordium/concordium-rust-smart-contracts/blob/c4d95504a51c15bdbfec503c9e8bf5e93a42e24d/examples/piggy-bank/part1/src/lib.rs#L64
 */
export const smash = (account: string, index: bigint, subindex = 0n) => {
    detectConcordiumProvider()
        .then((provider) => {
            provider
                .sendTransaction(account, AccountTransactionType.UpdateSmartContractInstance, {
                    amount: new GtuAmount(0n), // This feels weird? Why do I need an amount for a non-payable receive?
                    contractAddress: {
                        index,
                        subindex,
                    },
                    receiveName: `${CONTRACT_NAME}.smash`,
                    maxContractExecutionEnergy: 30000n,
                } as UpdateContractPayload)
                .then((txHash) =>
                    console.log(`https://testnet.ccdscan.io/?dcount=1&dentity=transaction&dhash=${txHash}`)
                )
                .catch(alert);
        })
        .catch(() => {
            throw new Error('Concordium Wallet API not accessible');
        });
};

/**
 * Global application state.
 */
export type State = {
    isConnected: boolean;
    account: string | undefined;
};

export const state = createContext<State>({ isConnected: false, account: undefined });

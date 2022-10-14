/* eslint-disable no-alert */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext } from 'react';
import { detectConcordiumProvider } from '@concordium/browser-wallet-api-helpers';
import {
    AccountTransactionType,
    GtuAmount,
    ModuleReference,
    TransactionStatusEnum,
    UpdateContractPayload,
} from '@concordium/web-sdk';
import { RAW_SCHEMA } from './constant';

export const CONTRACT_NAME = 'PiggyBank';

/**
 * Action for initializing a smart contract for keeping a collections of tokens.
 */
export const createCollection = (address: string) => {
    return new Promise<bigint>((resolve, reject) => {
        detectConcordiumProvider()
            .then((provider) => {
                provider
                    .sendTransaction(address, AccountTransactionType.InitializeSmartContractInstance, {
                        amount: new GtuAmount(0n),
                        moduleRef: new ModuleReference(
                            '69d48cea644389f65be2cd807df746abc8b97d888dc98ae531030c2a3bffeee0'
                        ),
                        contractName: 'CIS2-NFT',
                        maxContractExecutionEnergy: 30000n,
                    })
                    .then((txHash) =>
                        setTimeout(function listen() {
                            provider
                                .getJsonRpcClient()
                                .getTransactionStatus(txHash)
                                .then((status) => {
                                    if (
                                        status &&
                                        status.status === TransactionStatusEnum.Finalized &&
                                        status.outcomes
                                    ) {
                                        const outcome = Object.values(status.outcomes)[0];
                                        if (outcome.result.outcome === 'success') {
                                            resolve((outcome.result.events[0] as any).address.index);
                                        } else {
                                            reject(new Error('failed'));
                                        }
                                        // return Index
                                    } else {
                                        setTimeout(listen, 3000);
                                    }
                                });
                        }, 3000)
                    )
                    .catch((e) => alert(e.message));
            })
            .catch(() => {
                throw new Error('Concordium Wallet API not accessible');
            });
    });
};

/**
 * Action for minting NFT's in a collection. This is only possible to do, if the account sending the transaction is the owner of the collection:
 */
export const mint = (account: string, id: string, url: string, index: bigint, subindex = 0n) => {
    return new Promise((resolve, reject) => {
        detectConcordiumProvider()
            .then((provider) => {
                provider
                    .sendTransaction(
                        account,
                        AccountTransactionType.UpdateSmartContractInstance,
                        {
                            amount: new GtuAmount(0n),
                            contractAddress: {
                                index,
                                subindex,
                            },
                            receiveName: `CIS2-NFT.mint`,
                            maxContractExecutionEnergy: 30000n,
                        } as UpdateContractPayload,
                        {
                            owner: { Account: [account] },
                            token_id: id,
                            metadata: { url, hash: { None: [] } },
                        },
                        RAW_SCHEMA
                    )
                    .then((txHash) =>
                        setTimeout(function listen() {
                            provider
                                .getJsonRpcClient()
                                .getTransactionStatus(txHash)
                                .then((status) => {
                                    if (
                                        status &&
                                        status.status === TransactionStatusEnum.Finalized &&
                                        status.outcomes
                                    ) {
                                        const outcome = Object.values(status.outcomes)[0];
                                        if (outcome.result.outcome === 'success') {
                                            resolve(txHash);
                                        } else {
                                            reject(new Error('failed'));
                                        }
                                        // return Index
                                    } else {
                                        setTimeout(listen, 3000);
                                    }
                                });
                        }, 3000)
                    );
            })
            .catch(() => {
                throw new Error('Concordium Wallet API not accessible');
            });
    });
};

export const isOwner = (account: string, index: bigint, subindex = 0n) => {
    return new Promise<boolean>((resolve) => {
        detectConcordiumProvider().then((provider) => {
            provider
                .getJsonRpcClient()
                .getInstanceInfo({ index, subindex })
                .then((info) => {
                    if (info) {
                        resolve(info.owner.address === account);
                    }
                })
                .catch((e) => alert(e.message));
        });
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

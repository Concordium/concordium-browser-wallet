/* eslint-disable no-console */
import { createContext } from 'react';
import { detectConcordiumProvider } from '@concordium/browser-wallet-api-helpers';
import { AccountTransactionType, GtuAmount, ModuleReference, toBuffer, TransactionStatusEnum, UpdateContractPayload } from '@concordium/web-sdk';
import { RAW_SCHEMA } from './constant';

export const CONTRACT_NAME = 'PiggyBank';

/**
 * Action for depositing an amount of microCCD to the piggy bank instance
 */
export const createCollection = (address: string) => {
    return new Promise((resolve, reject) => {
        detectConcordiumProvider()
        .then((provider) => {
            provider
                        .sendTransaction(
                            address,
                            AccountTransactionType.InitializeSmartContractInstance,
                            {
                                amount: new GtuAmount(0n),
                                moduleRef: new ModuleReference(
                                    '69d48cea644389f65be2cd807df746abc8b97d888dc98ae531030c2a3bffeee0'
                                ),
                                contractName: 'CIS2-NFT',
                                maxContractExecutionEnergy: 30000n,
                                parameter: toBuffer('')
                            }
                        )
                .then((txHash) =>
                    setTimeout(function listen() {
                        provider.getJsonRpcClient().getTransactionStatus(txHash).then((status) => {
                            if (status && status.status === TransactionStatusEnum.Finalized && status.outcomes) {
                                const outcome = Object.values(status.outcomes)[0];
                                if (outcome.result.outcome === 'success') {
                                    resolve((outcome.result.events[0] as any).address.index);
                                } else {
                                    reject('failed');
                                }
                                // return Index
                            } else {
                                setTimeout(listen, 3000);
                            }
                        })
                    }, 3000)
                )
                .catch(alert);
        })
            .catch((e) => {
                console.log(e);
            throw new Error('Concordium Wallet API not accessible');
        });
    })
};

/**
 * Action for smashing the piggy bank. This is only possible to do, if the account sending the transaction matches the owner of the piggy bank:
 * https://github.com/Concordium/concordium-rust-smart-contracts/blob/c4d95504a51c15bdbfec503c9e8bf5e93a42e24d/examples/piggy-bank/part1/src/lib.rs#L64
 */
export const mint = (account: string, id: string, url: string, index: bigint, subindex = 0n) => {
    return new Promise((resolve, reject) => {
        detectConcordiumProvider()
            .then((provider) => {
                provider
                    .sendTransaction(account, AccountTransactionType.UpdateSmartContractInstance, {
                        amount: new GtuAmount(0n),
                        contractAddress: {
                            index,
                            subindex,
                        },
                        receiveName: `CIS2-NFT.mint`,
                        maxContractExecutionEnergy: 30000n,
                    } as UpdateContractPayload, {
                        owner: {Account : [account]},
                        token_id: id,
                        metadata: { url, "hash": {"None": []} }
                    }, RAW_SCHEMA
                                    )
                    .then((txHash) =>
                        setTimeout(function listen() {
                            provider.getJsonRpcClient().getTransactionStatus(txHash).then((status) => {
                                if (status && status.status === TransactionStatusEnum.Finalized && status.outcomes) {
                                    const outcome = Object.values(status.outcomes)[0];
                                    if (outcome.result.outcome === 'success') {
                                        resolve(txHash);
                                    } else {
                                        reject('failed');
                                    }
                                    // return Index
                                } else {
                                    setTimeout(listen, 3000);
                                }
                            })
                        }, 3000)
                         )
            })
            .catch(() => {
                throw new Error('Concordium Wallet API not accessible');
            });
    });
};

export const isOwner = (account: string, index: bigint, subindex = 0n) => {
    return new Promise<boolean>((resolve, reject) => {
        detectConcordiumProvider()
            .then((provider) => {
                provider.getJsonRpcClient().getInstanceInfo({index, subindex}).then((info) =>{
                    if (info) {
                        resolve(info.owner.address === account)
                    }
                })
            })
    });
}

/**
 * Global application state.
 */
export type State = {
    isConnected: boolean;
    account: string | undefined;
};

export const state = createContext<State>({ isConnected: false, account: undefined });

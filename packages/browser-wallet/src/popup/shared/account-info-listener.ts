import { AccountAddress, HttpProvider, JsonRpcClient } from '@concordium/web-sdk';
import { sessionAccountInfoCache, useIndexedStorage } from '@shared/storage/access';
import { NetworkConfiguration } from '@shared/storage/types';
import { accountInfoCacheLock, updateRecord } from '@shared/storage/update';

import EventEmitter from 'events';
import { stringify } from 'wallet-common-helpers';

export const ACCOUNT_INFO_RETRIEVAL_INTERVAL_MS = 15000;

export class AccountInfoListener extends EventEmitter {
    private client: JsonRpcClient;

    private genesisHash: string;

    private interval: NodeJS.Timer | undefined = undefined;

    private accountsMap: Map<string, number> = new Map();

    constructor(network: NetworkConfiguration, cookie?: string) {
        super();
        this.client = new JsonRpcClient(new HttpProvider(network.jsonRpcUrl, undefined, undefined, cookie));
        this.genesisHash = network.genesisHash;
    }

    subscribe(accountAddress: string) {
        const existingSubscriptions = this.accountsMap.get(accountAddress);
        if (existingSubscriptions !== undefined) {
            this.accountsMap.set(accountAddress, existingSubscriptions + 1);
        } else {
            this.accountsMap.set(accountAddress, 1);
        }
    }

    unsubscribe(accountAddress: string) {
        const existingSubscriptions = this.accountsMap.get(accountAddress);
        if (existingSubscriptions !== undefined) {
            if (existingSubscriptions === 1) {
                this.accountsMap.delete(accountAddress);
            } else {
                this.accountsMap.set(accountAddress, existingSubscriptions - 1);
            }
        }
    }

    async listen() {
        this.interval = setInterval(async () => {
            try {
                if (this.accountsMap.size > 0) {
                    const lfBlockHash = (await this.client.getConsensusStatus()).lastFinalizedBlock;
                    for (const accountAddress of this.accountsMap.keys()) {
                        const address = new AccountAddress(accountAddress);
                        const accountInfo = await this.client.getAccountInfo(address, lfBlockHash);
                        if (accountInfo) {
                            updateRecord(
                                accountInfoCacheLock,
                                useIndexedStorage(sessionAccountInfoCache, async () => this.genesisHash),
                                accountInfo.accountAddress,
                                stringify(accountInfo)
                            );
                        }
                    }
                }
            } catch (e) {
                this.emit('error', e);
            }
        }, ACCOUNT_INFO_RETRIEVAL_INTERVAL_MS);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}

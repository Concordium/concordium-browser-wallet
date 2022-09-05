import { AccountAddress, AccountInfo, HttpProvider, JsonRpcClient } from '@concordium/web-sdk';
import {
    getGenesisHash,
    sessionAccountInfoCache,
    storedCurrentNetwork,
    useIndexedStorage,
} from '@shared/storage/access';
import { accountInfoCacheLock, updateRecord } from '@shared/storage/update';

import EventEmitter from 'events';
import JSONBig from 'json-bigint';

const accountInfoRetrievalIntervalMs = 15000;

export class AccountInfoEmitter extends EventEmitter {
    private client: JsonRpcClient;

    private interval: NodeJS.Timer | undefined = undefined;

    private accounts: AccountAddress[] = [];

    constructor(jsonRpcUrl: string) {
        super();
        this.client = new JsonRpcClient(new HttpProvider(jsonRpcUrl));
    }

    subscribe(
        accountAddress: string,
        listener: (accountInfo: AccountInfo) => void
    ): (accountInfo: AccountInfo) => void {
        if (!this.accounts.some((a) => a.address === accountAddress)) {
            const addressObj = new AccountAddress(accountAddress);
            this.accounts.push(addressObj);
        }
        this.on(accountAddress, listener);
        return listener;
    }

    unsubscribe(
        accountAddress: string,
        listener: (accountInfo: AccountInfo) => void
    ): (accountInfo: AccountInfo) => void {
        this.removeListener(accountAddress, listener);
        if (this.listenerCount(accountAddress) === 0) {
            this.accounts = this.accounts.filter((address) => accountAddress !== address.address);
        }
        return listener;
    }

    async listen() {
        this.interval = setInterval(async () => {
            try {
                if (this.accounts.length > 0) {
                    const lfBlockHash = (await this.client.getConsensusStatus()).lastFinalizedBlock;
                    for (const address of this.accounts) {
                        const accountInfo = await this.client.getAccountInfo(address, lfBlockHash);
                        if (accountInfo) {
                            const network = await storedCurrentNetwork.get();
                            if (network) {
                                updateRecord(
                                    accountInfoCacheLock,
                                    useIndexedStorage(sessionAccountInfoCache, getGenesisHash),
                                    accountInfo.accountAddress,
                                    JSONBig.stringify(accountInfo)
                                );
                            }
                            this.emit(address.address, accountInfo);
                        }
                    }
                }
            } catch (e) {
                this.emit('error', e);
            }
        }, accountInfoRetrievalIntervalMs);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}

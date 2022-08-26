import { AccountAddress, AccountInfo, HttpProvider, JsonRpcClient } from '@concordium/web-sdk';
import EventEmitter from 'events';

const accountInfoRetrievalIntervalMs = 15000;

interface AccountInfoEvents {
    totalchanged: (accountInfo: AccountInfo, address: string) => void;
    accountinfo: (accountInfo: AccountInfo, address: string) => void;
    error: (err: unknown) => void;
}

export declare interface AccountInfoEmitter {
    on<U extends keyof AccountInfoEvents>(event: U, listener: AccountInfoEvents[U]): this;

    removeAllListeners<U extends keyof AccountInfoEvents>(event: U): this;

    emit<U extends keyof AccountInfoEvents>(event: U, ...args: Parameters<AccountInfoEvents[U]>): boolean;
}

export class AccountInfoEmitter extends EventEmitter {
    private client: JsonRpcClient;

    private previousTotalMap: Map<string, bigint> = new Map();

    private interval: NodeJS.Timer | undefined = undefined;

    private accounts: AccountAddress[] = [];

    constructor(jsonRpcUrl: string) {
        super();
        this.client = new JsonRpcClient(new HttpProvider(jsonRpcUrl));
    }

    async listen(accountAddresses: string[]) {
        this.stop();

        for (const accountAddress of accountAddresses) {
            const accountAddressObject = new AccountAddress(accountAddress);
            this.accounts.push(accountAddressObject);
        }

        // Note that the calls to get the account info is intentionally done
        // in serial here (and in the interval) to limit the load on the server.
        // If optimizing this to happen in parallel, then it must be ensured that
        // the server can handle the number of requests received at the same time.

        try {
            const lastFinalizedBlockHash = (await this.client.getConsensusStatus()).lastFinalizedBlock;
            for (const accountAddress of accountAddresses) {
                const accountAddressObject = new AccountAddress(accountAddress);
                const accountInfo = await this.client.getAccountInfo(accountAddressObject, lastFinalizedBlockHash);
                if (accountInfo) {
                    this.emit('accountinfo', accountInfo, accountAddress);
                    this.emit('totalchanged', accountInfo, accountAddress);
                }
            }
        } catch (e) {
            this.emit('error', e);
        }

        this.interval = setInterval(async () => {
            try {
                const lfBlockHash = (await this.client.getConsensusStatus()).lastFinalizedBlock;
                for (const address of this.accounts) {
                    const accountInfo = await this.client.getAccountInfo(address, lfBlockHash);
                    if (accountInfo) {
                        this.emit('accountinfo', accountInfo, address.address);
                        if (accountInfo.accountAmount !== this.previousTotalMap.get(address.address)) {
                            this.emit('totalchanged', accountInfo, address.address);
                            this.previousTotalMap.set(address.address, accountInfo.accountAmount);
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

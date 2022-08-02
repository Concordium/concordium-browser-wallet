import { AccountAddress, AccountInfo, HttpProvider, JsonRpcClient } from '@concordium/web-sdk';
import EventEmitter from 'events';

const accountInfoRetrievalIntervalMs = 15000;

async function getAccountInfo(client: JsonRpcClient, accountAddress: AccountAddress): Promise<AccountInfo | undefined> {
    const lastFinalizedBlockHash = (await client.getConsensusStatus()).lastFinalizedBlock;
    return client.getAccountInfo(accountAddress, lastFinalizedBlockHash);
}

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

        // Note that the calls to get the account info is intentionally done
        // in serial here (and in the interval) to limit the load on the server.
        // If optimizing this to happen in parallel, then it must be ensured that
        // the server can handle the number of requests received at the same time.

        for (const accountAddress of accountAddresses) {
            const accountAddressObject = new AccountAddress(accountAddress);
            this.accounts.push(accountAddressObject);

            const accountInfo = await getAccountInfo(this.client, accountAddressObject);
            if (accountInfo) {
                this.emit('accountinfo', accountInfo, accountAddress);
                this.emit('totalchanged', accountInfo, accountAddress);
            }
        }

        this.interval = setInterval(async () => {
            for (const address of this.accounts) {
                const accountInfo = await getAccountInfo(this.client, address);
                if (accountInfo) {
                    this.emit('accountinfo', accountInfo, address.address);
                    if (accountInfo.accountAmount !== this.previousTotalMap.get(address.address)) {
                        this.emit('totalchanged', accountInfo, address.address);
                        this.previousTotalMap.set(address.address, accountInfo.accountAmount);
                    }
                }
            }
        }, accountInfoRetrievalIntervalMs);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}

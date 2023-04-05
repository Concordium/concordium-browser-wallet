import axios from 'axios';
import EventEmitter from 'events';
import { sleep } from '../utils/basicHelpers';
import ConcordiumLedgerClient from '../ledger/ConcordiumLedgerClient';
import { LedgerObserver } from './ledgerObserver';
import { emitterEvent, isConcordiumApp, LedgerSubscriptionAction } from './ledgerObserverHelper';

export default class LedgerEmulatorObserverImpl implements LedgerObserver {
    concordiumClient: ConcordiumLedgerClient | undefined;

    baseUrl: string;

    isConnected: boolean;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
        this.isConnected = false;
    }

    getLedgerClient(): ConcordiumLedgerClient {
        if (!this.concordiumClient) {
            throw new Error('A connection to the Ledger is not available.');
        }
        return this.concordiumClient;
    }

    async subscribeLedger(eventEmitter: EventEmitter): Promise<void> {
        const speculosEmulator = axios.create({ baseURL: this.baseUrl });

        // eslint-disable-next-line no-constant-condition
        while (true) {
            const source = axios.CancelToken.source();
            const timeout = setTimeout(() => {
                source.cancel();
            }, 5000);

            try {
                await speculosEmulator.get('/', {
                    cancelToken: source.token,
                });
                clearTimeout(timeout);

                if (!this.isConnected) {
                    this.concordiumClient = new ConcordiumLedgerClient();

                    let appAndVersion;
                    try {
                        appAndVersion = await this.concordiumClient.getAppAndVersion();
                    } catch (e) {
                        throw new Error('Unable to get current app');
                    }
                    if (!appAndVersion) {
                        // We could not extract the version information.
                        eventEmitter.emit(emitterEvent, LedgerSubscriptionAction.RESET);
                        return;
                    }

                    if (isConcordiumApp(appAndVersion)) {
                        eventEmitter.emit(
                            emitterEvent,
                            LedgerSubscriptionAction.CONNECTED_SUBSCRIPTION,
                            'Ledger Emulator'
                        );
                        this.isConnected = true;
                    }
                }
            } catch (e) {
                if (this.isConnected) {
                    this.isConnected = false;
                    // The emulator was not reachable.
                    if (this.concordiumClient) {
                        this.concordiumClient.closeTransport();
                    }
                    eventEmitter.emit(emitterEvent, LedgerSubscriptionAction.RESET);
                }
            }

            await sleep(5000);
        }
    }

    closeTransport(): void {
        if (this.concordiumClient) {
            this.concordiumClient.closeTransport();
        }
    }

    async resetTransport(eventEmitter: EventEmitter) {
        throw new Error(`Reset transport not implemented for the emulator: ${eventEmitter}`);
    }
}

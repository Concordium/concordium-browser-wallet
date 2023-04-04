import TransportWeb from '@ledgerhq/hw-transport-webhid';
import type { Observer, DescriptorEvent, Subscription } from '@ledgerhq/hw-transport';
import EventEmitter from 'events';
import ConcordiumLedgerClient from '../ledger/ConcordiumLedgerClient';
import { LedgerObserver } from './ledgerObserver';
import { isConcordiumApp, isOutdated, LedgerIpcCommands, LedgerSubscriptionAction } from './ledgerObserverHelper';

export default class LedgerObserverImpl implements LedgerObserver {
    concordiumClient: ConcordiumLedgerClient | undefined;

    ledgerSubscription: Subscription | undefined;

    getLedgerClient(): ConcordiumLedgerClient {
        if (!this.concordiumClient) {
            throw new Error('A connection to the Ledger is not available.');
        }
        return this.concordiumClient;
    }

    async subscribeLedger(eventEmitter: EventEmitter): Promise<void> {
        if (!this.ledgerSubscription) {
            this.ledgerSubscription = TransportWeb.listen(this.createLedgerObserver(eventEmitter));
        }
    }

    async resetTransport() {
        const transport = await TransportWeb.create();
        this.concordiumClient = new ConcordiumLedgerClient(transport);

        // There may be a previous message from the previous channel on the transport
        // (even though we just opened a new one!). Therefore we do this call to get rid
        // of any such old message that would otherwise fail elsewhere.
        try {
            await this.concordiumClient.getAppAndVersion();
        } catch (_e) {
            // Expected to happen. Do nothing with the error.
        }
    }

    closeTransport(): void {
        if (this.concordiumClient) {
            this.concordiumClient.closeTransport();
        }
    }

    /**
     * Creates an observer for events happening on the Ledger. The events will be sent using
     * IPC to the window provided.
     * @param eventEmitter the emitter that should receive events from the observer
     */
    createLedgerObserver(eventEmitter: EventEmitter): Observer<DescriptorEvent<HIDDevice>> {
        const ledgerObserver: Observer<DescriptorEvent<HIDDevice>> = {
            complete: () => {
                // This is expected to never trigger.
            },
            error: () => {
                eventEmitter.emit(LedgerIpcCommands.listenChannel, LedgerSubscriptionAction.ERROR_SUBSCRIPTION);
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            next: async (event: any) => {
                if (event.type === 'add') {
                    const deviceName = event.deviceModel.productName;
                    const transport = await TransportWeb.create();
                    this.concordiumClient = new ConcordiumLedgerClient(transport);
                    let appAndVersion;
                    try {
                        appAndVersion = await this.concordiumClient.getAppAndVersion();
                    } catch (e) {
                        throw new Error(`Unable to get current app: ${e}`);
                    }
                    let action;
                    if (!appAndVersion) {
                        // We could not extract the version information.
                        action = LedgerSubscriptionAction.RESET;
                    } else if (!isConcordiumApp(appAndVersion)) {
                        // The device has been connected, but the Concordium application has not
                        // been opened yet.
                        action = LedgerSubscriptionAction.PENDING;
                    } else if (isOutdated(appAndVersion)) {
                        // The device has been connected, but the Concordium application is outdated
                        action = LedgerSubscriptionAction.OUTDATED;
                    } else {
                        action = LedgerSubscriptionAction.CONNECTED_SUBSCRIPTION;
                    }
                    eventEmitter.emit(LedgerIpcCommands.listenChannel, action, deviceName);
                } else if (event.type === 'remove') {
                    if (this.concordiumClient) {
                        this.concordiumClient.closeTransport();
                    }
                    eventEmitter.emit(LedgerIpcCommands.listenChannel, LedgerSubscriptionAction.RESET);
                }
            },
        };
        return ledgerObserver;
    }
}

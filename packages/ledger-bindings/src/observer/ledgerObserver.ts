import EventEmitter from 'events';
import ConcordiumLedgerClient from '../ledger/ConcordiumLedgerClient';

export interface LedgerObserver {
    getLedgerClient(): ConcordiumLedgerClient | undefined;
    subscribeLedger(eventEmitter: EventEmitter): Promise<void>;
    closeTransport(): void;
    resetTransport(eventEmitter: EventEmitter): Promise<void>;
}

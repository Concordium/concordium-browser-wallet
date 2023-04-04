import { AppAndVersion } from '../ledger/GetAppAndVersion';

export enum LedgerStatusType {
    DISCONNECTED,
    ERROR,
    CONNECTED,
    OUTDATED,
    OPEN_APP,
    LOADING,
    AWAITING_USER_INPUT,
}

export type LedgerSubmitHandler = () => Promise<void>;

export function isConcordiumApp({ name }: AppAndVersion) {
    return name === 'Concordium';
}

export function isOutdated(v: AppAndVersion) {
    return parseInt(v.version.split('.')[0], 10) < 4;
}

export enum LedgerSubscriptionAction {
    CONNECTED_SUBSCRIPTION,
    OUTDATED,
    PENDING,
    RESET,
    ERROR_SUBSCRIPTION,
}

export enum LedgerIpcCommands {
    onAwaitVerificationKey = 'LEDGER_ON_AWAIT_VERIFICATION_KEY',
    onVerificationKeysConfirmed = 'LEDGER_ON_VERIFICATION_KEY_CONFIRMED',
    listenChannel = 'LEDGER_LISTEN_CHANNEL',
}

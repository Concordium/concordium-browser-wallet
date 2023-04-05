import { AppAndVersion } from '../ledger/GetAppAndVersion';

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

export const emitterEvent = 'LEDGER_LISTEN_CHANNEL';

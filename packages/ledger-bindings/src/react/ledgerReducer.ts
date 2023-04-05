import ConcordiumLedgerClient from '../ledger/ConcordiumLedgerClient';

export enum LedgerStatusType {
    DISCONNECTED,
    ERROR,
    CONNECTED,
    OUTDATED,
    OPEN_APP,
    LOADING,
    AWAITING_USER_INPUT,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Action<T = any> {
    type: T;
}

export enum LedgerActionType {
    PENDING,
    CONNECTED,
    ERROR,
    LOADING,
    DISCONNECT,
    SET_STATUS_TEXT,
    FINISHED,
    CLEANUP,
    OUTDATED,
}
export type Reducer<S, A extends Action> = (state: S | undefined, action: A) => S;
export interface LedgerReducerState {
    text: string | JSX.Element;
    status: LedgerStatusType;
    deviceName?: string;
    client?: ConcordiumLedgerClient;
}

interface PendingAction extends Action<LedgerActionType.PENDING> {
    status: LedgerStatusType;
    deviceName?: string;
}

export const pendingAction = (status: LedgerStatusType, deviceName?: string): PendingAction => ({
    type: LedgerActionType.PENDING,
    status,
    deviceName,
});

interface ConnectedAction extends Action<LedgerActionType.CONNECTED> {
    deviceName: string;
    client: ConcordiumLedgerClient;
}

export const connectedAction = (deviceName: string, client: ConcordiumLedgerClient): ConnectedAction => ({
    type: LedgerActionType.CONNECTED,
    deviceName,
    client,
});

type LoadingAction = Action<LedgerActionType.LOADING>;

export const loadingAction = (): LoadingAction => ({
    type: LedgerActionType.LOADING,
});

type DisconnectAction = Action<LedgerActionType.DISCONNECT>;

export const disconnectAction = (): DisconnectAction => ({
    type: LedgerActionType.DISCONNECT,
});

type CleanupAction = Action<LedgerActionType.CLEANUP>;

export const cleanupAction = (): CleanupAction => ({
    type: LedgerActionType.CLEANUP,
});

interface OutdatedAction extends Action<LedgerActionType.OUTDATED> {
    deviceName: string;
}

export const outdatedAction = (deviceName: string): OutdatedAction => ({
    type: LedgerActionType.OUTDATED,
    deviceName,
});

interface ErrorAction extends Action<LedgerActionType.ERROR> {
    message?: string | JSX.Element;
}

export const errorAction = (message?: string | JSX.Element): ErrorAction => ({
    type: LedgerActionType.ERROR,
    message,
});

interface SetStatusTextAction extends Action<LedgerActionType.SET_STATUS_TEXT> {
    text: string | JSX.Element;
}

export const setStatusTextAction = (text: string | JSX.Element): SetStatusTextAction => ({
    type: LedgerActionType.SET_STATUS_TEXT,
    text,
});

type FinishedAction = Action<LedgerActionType.FINISHED>;

export const finishedAction = (): FinishedAction => ({
    type: LedgerActionType.FINISHED,
});

type LedgerAction =
    | PendingAction
    | ConnectedAction
    | LoadingAction
    | DisconnectAction
    | ErrorAction
    | SetStatusTextAction
    | CleanupAction
    | OutdatedAction
    | FinishedAction;

function getStatusMessage(status: LedgerStatusType, deviceName?: string): string {
    switch (status) {
        case LedgerStatusType.DISCONNECTED:
            return 'Waiting for device. Please connect your Ledger.';
        case LedgerStatusType.AWAITING_USER_INPUT:
            return 'Waiting for user to finish the process on device';
        case LedgerStatusType.ERROR:
            return 'Unable to connect to device';
        case LedgerStatusType.CONNECTED:
            return `${deviceName} is ready!`;
        case LedgerStatusType.OPEN_APP:
            return `Please open the Concordium application on your ${deviceName}`;
        case LedgerStatusType.LOADING:
            return `Waiting for device`;
        case LedgerStatusType.OUTDATED:
            return `Your ${deviceName} is outdated. Please update the concordium application on your ${deviceName}.`;
        default:
            throw new Error('Unsupported status');
    }
}

export const getInitialState = (): LedgerReducerState => ({
    status: LedgerStatusType.DISCONNECTED,
    text: getStatusMessage(LedgerStatusType.DISCONNECTED),
});

const ledgerReducer: Reducer<LedgerReducerState, LedgerAction> = (
    // eslint-disable-next-line @typescript-eslint/default-param-last
    state = getInitialState(),
    action
) => {
    const deviceName = (action as PendingAction | ConnectedAction | OutdatedAction).deviceName || state.deviceName;

    switch (action.type) {
        case LedgerActionType.PENDING:
            return {
                ...state,
                status: action.status,
                text: getStatusMessage(action.status, deviceName),
                deviceName,
            };
        case LedgerActionType.CONNECTED:
            return {
                status: LedgerStatusType.CONNECTED,
                deviceName,
                client: action.client,
                text: getStatusMessage(LedgerStatusType.CONNECTED, deviceName),
            };
        case LedgerActionType.LOADING:
            return {
                ...state,
                status: LedgerStatusType.LOADING,
                text: getStatusMessage(LedgerStatusType.LOADING, deviceName),
            };
        case LedgerActionType.DISCONNECT:
            return getInitialState();
        case LedgerActionType.SET_STATUS_TEXT:
            return { ...state, text: action.text };
        case LedgerActionType.ERROR:
            return {
                ...state,
                status: LedgerStatusType.ERROR,
                text: action.message || getStatusMessage(LedgerStatusType.ERROR),
            };
        case LedgerActionType.FINISHED:
            return {
                ...state,
                status: LedgerStatusType.CONNECTED,
                text: getStatusMessage(LedgerStatusType.CONNECTED, deviceName),
            };
        case LedgerActionType.OUTDATED:
            return {
                ...state,
                status: LedgerStatusType.OUTDATED,
                text: getStatusMessage(LedgerStatusType.OUTDATED, deviceName),
            };
        case LedgerActionType.CLEANUP: {
            const status = state.status === LedgerStatusType.ERROR ? LedgerStatusType.CONNECTED : state.status;
            return {
                ...state,
                status,
                text: getStatusMessage(status, deviceName),
            };
        }
        default:
            return state;
    }
};

export default ledgerReducer;

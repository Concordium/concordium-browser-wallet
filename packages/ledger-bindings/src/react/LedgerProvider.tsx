import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import EventEmitter from 'events';
import ConcordiumLedgerClient from '../ledger/ConcordiumLedgerClient';
import { LedgerObserver, LedgerObserverImpl } from '../observer';
import { instanceOfClosedWhileSendingError } from '../ledger/ClosedWhileSendingError';
import { instanceOfTransportStatusError } from '../ledger/TransportStatusError';
import { instanceOfTransportError, isInvalidChannelError } from '../ledger/TransportError';
import getErrorDescription from '../ledger/ErrorCodes';
import ledgerReducer, {
    Action,
    cleanupAction,
    errorAction,
    finishedAction,
    getInitialState,
    LedgerReducerState,
    pendingAction,
    setStatusTextAction,
    LedgerStatusType,
    outdatedAction,
    loadingAction,
    connectedAction,
} from './ledgerReducer';
import { LedgerIpcCommands, LedgerSubscriptionAction } from '../observer/ledgerObserverHelper';

export type LedgerCallback<ReturnType = void> = (
    client: ConcordiumLedgerClient,
    setStatusText: (message: string | JSX.Element) => void
) => Promise<ReturnType>;

export type LedgerSubmitHandler = () => Promise<void>;

const ledgerContext = createContext<
    | ({
          ledgerObserver: LedgerObserver;
          eventsEmitter: EventEmitter;
          dispatch: (action: Action<LedgerActionType>) => void;
      } & LedgerReducerState)
    | undefined
>(undefined);

interface Props {
    children: ReactNode;
}

enum LedgerActionType {
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

/**
 * Context for enabling the useLedger hook.
 */
export default function LedgerContext({ children }: Props) {
    const ledgerObserver = useMemo(() => new LedgerObserverImpl(), []);
    const [state, setState] = useState<LedgerReducerState>(getInitialState());

    const context = useMemo(() => {
        const eventsEmitter = new EventEmitter();
        ledgerObserver?.subscribeLedger(eventsEmitter);
        return { ledgerObserver, eventsEmitter };
    }, []);

    const dispatch = useCallback((action: Action) => {
        setState(ledgerReducer(state, action));
    }, []);

    useEffect(() => {
        context?.eventsEmitter.on(
            LedgerIpcCommands.listenChannel,
            (action: LedgerSubscriptionAction, deviceName: string) => {
                switch (action) {
                    case LedgerSubscriptionAction.ERROR_SUBSCRIPTION:
                        dispatch(errorAction());
                        return;
                    case LedgerSubscriptionAction.PENDING:
                        dispatch(pendingAction(LedgerStatusType.OPEN_APP, deviceName));
                        return;
                    case LedgerSubscriptionAction.OUTDATED:
                        dispatch(outdatedAction(deviceName));
                        return;
                    case LedgerSubscriptionAction.RESET:
                        dispatch(loadingAction());
                        return;
                    case LedgerSubscriptionAction.CONNECTED_SUBSCRIPTION:
                        dispatch(connectedAction(deviceName, new ConcordiumLedgerClient()));
                        return;
                    default:
                        throw new Error(`Received an unknown action ${action}`);
                }
            }
        );
        return () => {
            context?.eventsEmitter.removeAllListeners(LedgerIpcCommands.listenChannel);
        };
    }, []);

    const value = useMemo(() => ({ ...context, ...state, dispatch }), [context, state]);

    return <ledgerContext.Provider value={value}>{children}</ledgerContext.Provider>;
}

export function useLedger(
    ledgerCallback: LedgerCallback,
    onSignError: (e: Error) => void
): {
    isReady: boolean;
    status: LedgerStatusType;
    statusText: string | JSX.Element;
    submitHandler: LedgerSubmitHandler;
} {
    const context = useContext(ledgerContext);
    if (!context) {
        throw Error('missing context');
    }
    const { ledgerObserver, status, dispatch, eventsEmitter, text } = context;
    const client = ledgerObserver?.getLedgerClient?.();
    const isReady = (status === LedgerStatusType.CONNECTED || status === LedgerStatusType.ERROR) && Boolean(client);

    useEffect(() => {
        return function cleanup() {
            if (client) {
                ledgerObserver.closeTransport();
                dispatch(cleanupAction());
            }
        };
    }, [client, dispatch]);

    const submitHandler: LedgerSubmitHandler = useCallback(async () => {
        dispatch(pendingAction(LedgerStatusType.AWAITING_USER_INPUT));

        try {
            if (client) {
                await ledgerCallback(client, (t) => dispatch(setStatusTextAction(t)));
            }
            dispatch(finishedAction());
        } catch (e) {
            if (instanceOfClosedWhileSendingError(e)) {
                dispatch(finishedAction());
            } else if (instanceOfTransportError(e) && isInvalidChannelError(e)) {
                await ledgerObserver.resetTransport(eventsEmitter);
                const errorMessage =
                    'Invalid channel. Please close any other application attempting to connect to the Ledger and try again.';
                dispatch(errorAction(errorMessage));
            } else {
                let errorMessage;
                if (instanceOfTransportStatusError(e)) {
                    errorMessage = getErrorDescription(e.statusCode);
                } else {
                    errorMessage = `${e}`;
                }
                dispatch(errorAction(errorMessage));
            }
            onSignError(e as Error);
        }
    }, [client, ledgerCallback, onSignError]);

    return {
        isReady,
        status,
        statusText: text,
        submitHandler,
    };
}

import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { memoryStoreUpdateAtom } from '@popup/store/settings';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { InternalMessageType } from '@messaging';
import { logError } from '@shared/utils/log-helpers';

export const MemoryStoreKeys = { Passcode: 'passcode' };

const memoryStoreMessageHandler = (key: string, method: 'get' | 'set', value?: string) => {
    return popupMessageHandler.sendInternalMessage(
        InternalMessageType.MemoryStore,
        JSON.stringify({ key, method, value })
    );
};

export const useMemoryStoreValue = (key: string) => {
    const latestMemoryStoreUpdate = useAtomValue(memoryStoreUpdateAtom);
    const [state, setState] = useState({
        loading: true,
        value: undefined,
    });

    useEffect(() => {
        setState({ loading: true, value: state.value });

        memoryStoreMessageHandler(key, 'get').then((data) => {
            setState({ loading: false, value: data });
        });
    }, [latestMemoryStoreUpdate]);

    return state;
};

export const useSetMemoryStore = (key: string) => async (value?: string) => {
    memoryStoreMessageHandler(key, 'set', value).catch((err) => {
        logError(err);
    });
};

export const useMemoryStore = (
    key: string
): [{ loading: boolean; value: string | undefined }, (value?: string) => void] => {
    return [useMemoryStoreValue(key), useSetMemoryStore(key)];
};

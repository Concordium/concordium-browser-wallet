import { ExtensionMessageHandler } from '@messaging';
import { parse } from '@shared/utils/payload-helpers';
import { BackgroundResponseStatus } from '@shared/utils/types';
import { memoryStoreUpdate } from '@shared/storage/access';

export const MemoryStoreKeys = {
    Passcode: 'passcode',
};

type StoreValue = string;

function createStore(initialValue: StoreValue) {
    let value = initialValue;

    return {
        get() {
            return value;
        },
        set(newValue: StoreValue) {
            value = newValue;
            // Local storage is used to trigger update
            // In all components that are currently using this storage
            memoryStoreUpdate.set(Date.now());
            return newValue;
        },
    };
}

const MemoryStore = {
    [MemoryStoreKeys.Passcode]: createStore(''),
};

type MemoryStoreInput = { key: string; method: 'get' | 'set'; value: string };

export const createMemoryStoreHandler: ExtensionMessageHandler = (msg, _sender, respond) => {
    const { key, method, value }: MemoryStoreInput = parse(msg.payload);

    try {
        respond(MemoryStore[key][method](value));
    } catch (e) {
        respond({ status: BackgroundResponseStatus.Error, error: (e as Error).message });
    }

    return true;
};

export const memoryStoreAccess = (key: string) => MemoryStore[key];

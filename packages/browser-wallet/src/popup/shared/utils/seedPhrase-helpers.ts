import { Buffer } from 'buffer/';
import { useAtomValue } from 'jotai';
import { encryptedSeedPhraseAtom, sessionPasscodeAtom } from '@popup/store/settings';
import { noOp, useAsyncMemo } from 'wallet-common-helpers';
import { mnemonicToSeedSync } from '@scure/bip39';
import { decrypt } from '../crypto';

export function useDecryptedSeedPhrase(onError: (e: Error) => void = noOp) {
    const encryptedSeed = useAtomValue(encryptedSeedPhraseAtom);
    const passcode = useAtomValue(sessionPasscodeAtom);

    const seed = useAsyncMemo(
        async () => {
            if (encryptedSeed.loading || passcode.loading) {
                return undefined;
            }
            if (encryptedSeed.value && passcode.value) {
                return Buffer.from(mnemonicToSeedSync(await decrypt(encryptedSeed.value, passcode.value))).toString(
                    'hex'
                );
            }
            throw new Error('SeedPhrase should not be retrieved without unlocking the wallet.');
        },
        onError,
        []
    );

    return seed;
}

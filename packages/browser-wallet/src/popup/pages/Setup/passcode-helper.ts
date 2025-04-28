import { passcodeAtom } from '@popup/state';
import { sessionPasscodeAtom } from '@popup/store/settings';
import { useAtomValue } from 'jotai';

export function usePasscodeInSetup() {
    const passcode = useAtomValue(passcodeAtom);
    const sessionPasscode = useAtomValue(sessionPasscodeAtom);

    if (passcode) {
        // In setup flow, have not closed the popup at any point.
        return passcode;
    }

    if (sessionPasscode.loading) {
        return undefined;
    }
    return sessionPasscode.value;
}

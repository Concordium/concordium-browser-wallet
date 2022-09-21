import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import Button from '@popup/shared/Button';
import { createAgeProofV1 } from '@concordium/web-sdk';
import { useAtomValue } from 'jotai';
import { credentialsAtom, selectedAccountAtom } from '@popup/store/account';
import { identitiesAtom } from '@popup/store/identity';
import { ConfirmedIdentity } from '@shared/storage/types';
import { networkConfigurationAtom } from '@popup/store/settings';
import { useDecryptedSeedPhrase } from '@popup/shared/utils/seedPhrase-helpers';
import { getGlobal, getNet } from '@shared/utils/network-helpers';
import ExternalRequestLayout from '@popup/page-layouts/ExternalRequestLayout';

interface Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSubmit(proof: any): void;
    onReject(): void;
}

export default function GenerateProof({ onSubmit, onReject }: Props) {
    const { withClose, onClose } = useContext(fullscreenPromptContext);
    const selectedAccount = useAtomValue(selectedAccountAtom);
    const credentials = useAtomValue(credentialsAtom);
    const identities = useAtomValue(identitiesAtom);
    const network = useAtomValue(networkConfigurationAtom);
    const seedPhrase = useDecryptedSeedPhrase();

    const credential = useMemo(
        () => credentials.find((c) => c.address === selectedAccount),
        [credentials, selectedAccount]
    );

    const identity = useMemo(
        () =>
            identities.find((i) => {
                return i.providerIndex === credential?.providerIndex && i.index === credential?.identityIndex;
            }),
        [selectedAccount, identities, credentials]
    );

    useEffect(() => onClose(onReject), [onClose, onReject]);

    const handleSubmit = useCallback(async () => {
        const global = await getGlobal(network);

        if (!credential) {
            throw new Error('no crd');
        }
        if (!seedPhrase) {
            throw new Error('no seed phrase');
        }
        return createAgeProofV1({
            identityIndex: credential.identityIndex,
            identityProviderIndex: credential.providerIndex,
            credNumber: credential.credNumber,
            idObject: (identity as ConfirmedIdentity).idObject.value,
            seedAsHex: seedPhrase,
            net: getNet(network),
            globalContext: global,
        });
    }, [credential, identity, seedPhrase, network]);

    return (
        <ExternalRequestLayout>
            <div className="h-full flex-column align-center">
                <div>A proof of your age has been requested.</div>
                <br />
                <div className="flex p-b-10 m-t-auto">
                    <Button onClick={() => handleSubmit().then(withClose(onSubmit))}>Make me a proof!</Button>
                </div>
            </div>
        </ExternalRequestLayout>
    );
}

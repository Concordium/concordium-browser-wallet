import React, { useCallback, useContext, useEffect } from 'react';
import { InternalMessageType } from '@concordium/browser-wallet-message-hub';
import { popupMessageHandler } from '@popup/shared/message-handler';
import ExternalRequestLayout from '@popup/page-layouts/ExternalRequestLayout';
import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import Button from '@popup/shared/Button';
import { IdStatement } from '@concordium/web-sdk';
import { useLocation } from 'react-router-dom';
import { useAtomValue, useSetAtom } from 'jotai';
import { selectedIdentityAtom } from '@popup/store/identity';
import { useSelectedCredential } from '@popup/shared/utils/account-helpers';
import { jsonRpcClientAtom, networkConfigurationAtom } from '@popup/store/settings';
import { addToastAtom } from '@popup/state';
import { useDecryptedSeedPhrase } from '@popup/shared/utils/seed-phrase-helpers';
import { getGlobal, getNet } from '@shared/utils/network-helpers';
import { ConfirmedIdentity } from '@shared/storage/types';

type Props = {
    onSubmit(proof: unknown): void;
    onReject(): void;
};

interface Location {
    state: {
        payload: {
            accountAddress: string;
            statement: IdStatement;
            challenge: string;
            url: string;
        };
    };
}

export default function IdProofRequest({ onReject, onSubmit }: Props) {
    const { state } = useLocation() as Location;
    const { statement, challenge } = state.payload;
    const { onClose, withClose } = useContext(fullscreenPromptContext);
    const identity = useAtomValue(selectedIdentityAtom);
    const credential = useSelectedCredential();
    const network = useAtomValue(networkConfigurationAtom);
    const client = useAtomValue(jsonRpcClientAtom);
    const addToast = useSetAtom(addToastAtom);
    const recoveryPhrase = useDecryptedSeedPhrase((e) => addToast(e.message));

    const handleSubmit = useCallback(async () => {
        if (!recoveryPhrase) {
            throw new Error('Missing recovery phrase');
        }
        if (!network) {
            throw new Error('Network is not specified');
        }

        if (!credential) {
            throw new Error('no crd');
        }
        if (!recoveryPhrase) {
            throw new Error('no seed phrase');
        }

        const global = await getGlobal(client);

        return popupMessageHandler.sendInternalMessage(InternalMessageType.CreateIdProof, {
            identityIndex: credential.identityIndex,
            identityProviderIndex: credential.providerIndex,
            credNumber: credential.credNumber,
            idObject: (identity as ConfirmedIdentity).idObject.value,
            seedAsHex: recoveryPhrase,
            net: getNet(network),
            globalContext: global,
            statement,
            challenge,
        });
    }, [credential, identity, recoveryPhrase, network]);

    useEffect(() => onClose(onReject), [onClose, onReject]);

    return (
        <ExternalRequestLayout>
            <pre>{JSON.stringify(statement, undefined, 2)}</pre>
            <br />
            <Button onClick={withClose(onReject)}>reject</Button>
            <Button
                onClick={() =>
                    handleSubmit()
                        .then(withClose(onSubmit))
                        .catch((e) => addToast(e.message))
                }
            >
                Submit
            </Button>
        </ExternalRequestLayout>
    );
}

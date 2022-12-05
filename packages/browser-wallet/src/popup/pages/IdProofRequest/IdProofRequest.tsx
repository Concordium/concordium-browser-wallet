import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { IdStatement, StatementTypes, RevealStatement, IdProofOutput } from '@concordium/web-sdk';
import { InternalMessageType } from '@concordium/browser-wallet-message-hub';

import { popupMessageHandler } from '@popup/shared/message-handler';
import { selectedIdentityAtom } from '@popup/store/identity';
import { useSelectedCredential } from '@popup/shared/utils/account-helpers';
import { jsonRpcClientAtom, networkConfigurationAtom } from '@popup/store/settings';
import { addToastAtom } from '@popup/state';
import { useDecryptedSeedPhrase } from '@popup/shared/utils/seed-phrase-helpers';
import { getGlobal, getNet } from '@shared/utils/network-helpers';
import { ConfirmedIdentity } from '@shared/storage/types';
import { BackgroundResponseStatus, IdProofBackgroundResponse } from '@shared/utils/types';
import PendingArrows from '@assets/svg/pending-arrows.svg';
import ExternalRequestLayout from '@popup/page-layouts/ExternalRequestLayout';
import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import Button from '@popup/shared/Button';
import ButtonGroup from '@popup/shared/ButtonGroup';
import { displayUrl } from '@popup/shared/utils/string-helpers';
import { DisplayRevealStatement, DisplaySecretStatement } from './DisplayStatement';
import { SecretStatement } from './DisplayStatement/utils';

type Props = {
    onSubmit(proof: IdProofOutput): void;
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
    const { statement, challenge, url, accountAddress: account } = state.payload;
    const { onClose, withClose } = useContext(fullscreenPromptContext);
    const { t } = useTranslation('idProofRequest');
    const identity = useAtomValue(selectedIdentityAtom);
    const credential = useSelectedCredential();
    const network = useAtomValue(networkConfigurationAtom);
    const client = useAtomValue(jsonRpcClientAtom);
    const addToast = useSetAtom(addToastAtom);
    const recoveryPhrase = useDecryptedSeedPhrase((e) => addToast(e.message));
    const dappName = displayUrl(url);

    const [creatingProof, setCreatingProof] = useState<boolean>(false);
    const [canProove, setCanProove] = useState(statement.length > 0);

    const reveals = statement.filter((s) => s.type === StatementTypes.RevealAttribute) as RevealStatement[];
    const secrets = statement.filter((s) => s.type !== StatementTypes.RevealAttribute) as SecretStatement[];

    const handleSubmit = useCallback(async () => {
        if (!recoveryPhrase) {
            throw new Error('Missing recovery phrase');
        }
        if (!network) {
            throw new Error('Network is not specified');
        }
        if (!credential) {
            throw new Error('Missing credential');
        }

        const global = await getGlobal(client);

        const idProofResult: IdProofBackgroundResponse = await popupMessageHandler.sendInternalMessage(
            InternalMessageType.CreateIdProof,
            {
                identityIndex: credential.identityIndex,
                identityProviderIndex: credential.providerIndex,
                credNumber: credential.credNumber,
                idObject: (identity as ConfirmedIdentity).idObject.value,
                seedAsHex: recoveryPhrase,
                net: getNet(network),
                globalContext: global,
                statement,
                challenge,
            }
        );

        if (idProofResult.status !== BackgroundResponseStatus.Success) {
            throw new Error(idProofResult.reason);
        }
        return idProofResult.proof;
    }, [credential, identity, recoveryPhrase, network]);

    useEffect(() => onClose(onReject), [onClose, onReject]);

    const handleInvalidStatement = useCallback(() => {
        if (canProove) {
            setCanProove(false);
        }
    }, [canProove]);

    if (!account) {
        return null;
    }

    return (
        <ExternalRequestLayout>
            <div className="id-proof-request">
                <div>
                    <h1 className="m-t-0 text-center">{t('header', { dappName })}</h1>
                    {reveals.length !== 0 && (
                        <DisplayRevealStatement
                            className="m-t-10:not-first"
                            dappName={dappName}
                            account={account}
                            statements={reveals}
                            onInvalid={handleInvalidStatement}
                        />
                    )}
                    {secrets.map((s, i) => (
                        <DisplaySecretStatement
                            // eslint-disable-next-line react/no-array-index-key
                            key={i} // Allow this, as we don't expect these to ever change.
                            className="m-t-10:not-first"
                            dappName={dappName}
                            account={account}
                            statement={s}
                            onInvalid={handleInvalidStatement}
                        />
                    ))}
                </div>
                {creatingProof && <PendingArrows className="loading" />}
                <ButtonGroup className="id-proof-request__actions">
                    <Button onClick={withClose(onReject)}>{t('reject')}</Button>
                    <Button
                        onClick={() => {
                            setCreatingProof(true);
                            handleSubmit()
                                .then(withClose(onSubmit))
                                .catch((e) => {
                                    setCreatingProof(false);
                                    addToast(t('failedProof', { reason: e.message }));
                                });
                        }}
                        disabled={!canProove || creatingProof}
                    >
                        {t('accept')}
                    </Button>
                </ButtonGroup>
            </div>
        </ExternalRequestLayout>
    );
}

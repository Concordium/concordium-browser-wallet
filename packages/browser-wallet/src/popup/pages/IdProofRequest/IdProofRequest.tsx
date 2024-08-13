import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { IdStatement, StatementTypes, RevealStatement, IdProofOutput } from '@concordium/web-sdk';
import { InternalMessageType } from '@messaging';

import { popupMessageHandler } from '@popup/shared/message-handler';
import { identityByAddressAtomFamily } from '@popup/store/identity';
import { useCredential } from '@popup/shared/utils/account-helpers';
import { grpcClientAtom, networkConfigurationAtom } from '@popup/store/settings';
import { addToastAtom } from '@popup/state';
import { useDecryptedSeedPhrase } from '@popup/shared/utils/seed-phrase-helpers';
import { getGlobal, getNet } from '@shared/utils/network-helpers';
import { BackgroundResponseStatus, ProofBackgroundResponse } from '@shared/utils/types';
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
    const { loading: identityLoading, value: identity } = useAtomValue(identityByAddressAtomFamily(account));
    const credential = useCredential(account);
    const network = useAtomValue(networkConfigurationAtom);
    const client = useAtomValue(grpcClientAtom);
    const addToast = useSetAtom(addToastAtom);
    const recoveryPhrase = useDecryptedSeedPhrase((e) => addToast(e.message));
    const dappName = displayUrl(url);
    const [creatingProof, setCreatingProof] = useState<boolean>(false);
    const [canProve, setCanProve] = useState(statement.length > 0);
    const reveals = statement.filter((s) => s.type === StatementTypes.RevealAttribute) as RevealStatement[];
    const secrets = statement.filter((s) => s.type !== StatementTypes.RevealAttribute) as SecretStatement[];

    const handleSubmit = useCallback(async () => {
        if (!identity) {
            throw new Error('Missing identity');
        }
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

        const idProofResult: ProofBackgroundResponse<IdProofOutput> = await popupMessageHandler.sendInternalMessage(
            InternalMessageType.CreateIdProof,
            {
                identityIndex: credential.identityIndex,
                identityProviderIndex: credential.providerIndex,
                credNumber: credential.credNumber,
                idObject: identity.idObject.value,
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
        if (canProve) {
            setCanProve(false);
        }
    }, [canProve]);

    if (identityLoading || !identity) {
        return null;
    }

    return (
        <ExternalRequestLayout className="p-10">
            <div className="id-proof-request">
                <div>
                    <h3 className="m-t-0 text-center">{t('header', { dappName })}</h3>
                    {reveals.length !== 0 && (
                        <DisplayRevealStatement
                            className="m-t-10:not-first"
                            dappName={dappName}
                            identity={identity}
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
                            identity={identity}
                            statement={s}
                            onInvalid={handleInvalidStatement}
                        />
                    ))}
                </div>
                <ButtonGroup className="id-proof-request__actions">
                    <Button disabled={creatingProof} onClick={withClose(onReject)}>
                        {t('reject')}
                    </Button>
                    <Button
                        className="flex-center"
                        onClick={() => {
                            setCreatingProof(true);
                            handleSubmit()
                                .then(withClose(onSubmit))
                                .catch((e) => {
                                    setCreatingProof(false);
                                    addToast(
                                        e.message ? t('failedProofReason', { reason: e.message }) : t('failedProof')
                                    );
                                });
                        }}
                        disabled={!canProve || creatingProof}
                    >
                        {creatingProof ? (
                            <PendingArrows className="loading svg-white id-proof-request__loading-icon" />
                        ) : (
                            t('accept')
                        )}
                    </Button>
                </ButtonGroup>
            </div>
        </ExternalRequestLayout>
    );
}

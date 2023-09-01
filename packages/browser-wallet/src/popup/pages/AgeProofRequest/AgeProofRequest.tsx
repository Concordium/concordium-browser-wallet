import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { IdStatement, IdProofOutput } from '@concordium/web-sdk';
import { InternalMessageType } from '@concordium/browser-wallet-message-hub';

import { popupMessageHandler } from '@popup/shared/message-handler';
import { identityByAddressAtomFamily } from '@popup/store/identity';
import { useCredential } from '@popup/shared/utils/account-helpers';
import { grpcClientAtom, networkConfigurationAtom, sessionPasscodeAtom } from '@popup/store/settings';
import { addToastAtom } from '@popup/state';
import { useDecryptedSeedPhrase } from '@popup/shared/utils/seed-phrase-helpers';
import { getGlobal, getNet } from '@shared/utils/network-helpers';
import { BackgroundResponseStatus, IdProofBackgroundResponse } from '@shared/utils/types';
import PendingArrows from '@assets/svg/pending-arrows.svg';
import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import Button from '@popup/shared/Button';
import { displayUrl } from '@popup/shared/utils/string-helpers';
import { absoluteRoutes } from '@popup/constants/routes';
import Logo from '@assets/svg/concordium-with-letters.svg';
import { canProveStatement, SecretStatement, useAgeFromStatement } from '../IdProofRequest/DisplayStatement/utils';

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

export default function AgeProofRequest({ onReject, onSubmit }: Props) {
    const { state } = useLocation() as Location;
    const { statement, challenge, url, accountAddress: account } = state.payload;
    const { onClose, withClose } = useContext(fullscreenPromptContext);
    const { t } = useTranslation('ageProofRequest');
    const { loading: identityLoading, value: identity } = useAtomValue(identityByAddressAtomFamily(account));
    const credential = useCredential(account);
    const network = useAtomValue(networkConfigurationAtom);
    const client = useAtomValue(grpcClientAtom);
    const addToast = useSetAtom(addToastAtom);
    // TODO log this;
    const recoveryPhrase = useDecryptedSeedPhrase(undefined);
    const dappName = displayUrl(url);
    const [creatingProof, setCreatingProof] = useState<boolean>(false);
    const [canProve, setCanProve] = useState(statement.length > 0);
    const nav = useNavigate();
    const { loading: loadingPasscode, value: sessionPasscode } = useAtomValue(sessionPasscodeAtom);

    useEffect(() => {
        if (!identityLoading && identity && !canProveStatement(statement[0] as SecretStatement, identity)) {
            setCanProve(false);
        }
    }, [identityLoading]);

    const age = useAgeFromStatement(statement[0]);

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

        const idProofResult: IdProofBackgroundResponse = await popupMessageHandler.sendInternalMessage(
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

    const description = useMemo(() => {
        if (!age) {
            return '';
        }
        const { ageMin, ageMax } = age;

        if (ageMax === undefined) {
            return t('ageMin', { age: ageMin });
        }

        if (ageMin === undefined) {
            return t('ageMax', { age: ageMax });
        }

        if (ageMin === ageMax) {
            return t('ageExact', { age: ageMin });
        }

        return t('ageBetween', { ageMin, ageMax });
    }, [age]);

    if (loadingPasscode) {
        // This will be near instant, as we're just waiting for the Chrome async store
        return null;
    }

    if (!sessionPasscode) {
        return <Navigate to={absoluteRoutes.login.path} state={{ to: -1 }} />;
    }

    if (identityLoading || !identity) {
        return null;
    }

    return (
        <div className="age-proof__request">
            <div>
                <div className="age-proof__logos">
                    <Logo className="age-proof__logo" />
                </div>
                <h3 className="m-t-40 text-center age-proof__description">{description}</h3>
                <Button
                    clear
                    onClick={() => nav(absoluteRoutes.prompt.idProof.path, { state })}
                    className="age-proof__more-details"
                >
                    {t('moreDetails', { dappName })}
                </Button>
            </div>
            <Button
                className="flex-center age-proof__verify-button m-20"
                onClick={() => {
                    setCreatingProof(true);
                    handleSubmit()
                        .then(withClose(onSubmit))
                        .catch(() => {
                            setCreatingProof(false);
                            // TODO what to do
                            addToast('Failed');
                        });
                }}
                disabled={!canProve || creatingProof}
            >
                {creatingProof ? (
                    <PendingArrows className="loading svg-white id-proof-request__loading-icon" />
                ) : (
                    t(canProve ? 'verify' : 'notAbleToVerify')
                )}
            </Button>
        </div>
    );
}

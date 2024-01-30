import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { grpcClientAtom, networkConfigurationAtom } from '@popup/store/settings';
import {
    identitiesAtom,
    identityProvidersAtom,
    isRecoveringAtom,
    recoveryNewIdentitiesAtom,
    setRecoveryPayloadAtom,
} from '@popup/store/identity';
import PendingArrows from '@assets/svg/pending-arrows.svg';
import { BackgroundResponseStatus } from '@shared/utils/types';
import { getIdentityProviders } from '@popup/shared/utils/wallet-proxy';
import { getGlobal, getNet } from '@shared/utils/network-helpers';
import PageHeader from '@popup/shared/PageHeader';
import { absoluteRoutes } from '@popup/constants/routes';
import Button from '@popup/shared/Button';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { InternalMessageType } from '@concordium/browser-wallet-message-hub';

export default function RecoveryMain() {
    const { t } = useTranslation('recovery');
    const network = useAtomValue(networkConfigurationAtom);
    const client = useAtomValue(grpcClientAtom);
    const [providers, setProviders] = useAtom(identityProvidersAtom);
    const [isRecovering, setIsRecovering] = useAtom(isRecoveringAtom);
    const setRecoveryStatus = useSetAtom(setRecoveryPayloadAtom);
    const newIdentities = useAtomValue(recoveryNewIdentitiesAtom);
    const identities = useAtomValue(identitiesAtom);
    const [runRecovery, setRunRecovery] = useState<boolean>(true);
    const navigate = useNavigate();

    const onError = useCallback(
        (reason: string) =>
            navigate(absoluteRoutes.prompt.recovery.path, {
                state: { payload: { status: BackgroundResponseStatus.Error, reason } },
            }),
        []
    );

    useEffect(() => {
        if (runRecovery && !providers.length) {
            getIdentityProviders()
                .then(setProviders)
                .catch(() => onError('Unable to get list of identity providers'));
        }
    }, [runRecovery, providers.length]);

    useEffect(() => {
        if (!runRecovery || isRecovering.loading || !providers.length) {
            return;
        }

        setRunRecovery(false);

        if (isRecovering.value) {
            return;
        }

        getGlobal(client)
            .then(async (global) => {
                await setRecoveryStatus({
                    providers,
                    globalContext: global,
                    net: getNet(network),
                });
                return setIsRecovering(true);
            })
            .catch((error) => onError(error.message));
    }, [runRecovery, isRecovering.loading, isRecovering.value, providers.length]);

    const abort = useCallback(async () => {
        popupMessageHandler.sendInternalMessage(InternalMessageType.AbortRecovery);
        await setIsRecovering(false);
        navigate(absoluteRoutes.home.account.path);
    }, []);

    const noIdentities = useMemo(
        () => identities.length === 0 && (!newIdentities || newIdentities.length === 0),
        [identities.length, newIdentities?.length]
    );

    return (
        <>
            <PageHeader>{t('main.title')}</PageHeader>
            <div className="recovery__main onboarding-setup__page-with-header">
                <div className="onboarding-setup__page-with-header__description">{t('main.description')}</div>
                <PendingArrows className="loading" />
                {noIdentities && (
                    <p className="m-t-auto m-b-10">
                        {t('main.abort')}{' '}
                        <Button className="recovery__main__abort-button" clear onClick={abort}>
                            {t('main.abortClickable')}
                        </Button>
                    </p>
                )}
            </div>
        </>
    );
}

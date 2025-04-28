import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '@popup/popupX/shared/Button';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import Loader from '@popup/popupX/shared/Loader';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { grpcClientAtom, networkConfigurationAtom } from '@popup/store/settings';
import {
    identitiesAtom,
    identityProvidersAtom,
    isRecoveringAtom,
    recoveryNewIdentitiesAtom,
    setRecoveryPayloadAtom,
} from '@popup/store/identity';
import { BackgroundResponseStatus } from '@shared/utils/types';
import { getIdentityProviders } from '@popup/shared/utils/wallet-proxy';
import { getGlobal, getNet } from '@shared/utils/network-helpers';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { InternalMessageType } from '@messaging';

export default function RestoreMain() {
    const { t } = useTranslation('x', { keyPrefix: 'restore' });
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
        navigate(absoluteRoutes.home.path);
    }, []);

    const noIdentities = useMemo(
        () => identities.length === 0 && (!newIdentities || newIdentities.length === 0),
        [identities.length, newIdentities?.length]
    );

    return (
        <Page className="restore-main-x">
            <Page.Top heading={t('restoringWallet')} />
            <Page.Main>
                <Text.Capture>{t('searching')}</Text.Capture>
                <Loader />
            </Page.Main>
            {noIdentities && (
                <Page.Footer>
                    <Text.Capture>{t('abort')}</Text.Capture>
                    <Button.Main label={t('abortClickable')} onClick={abort} />
                </Page.Footer>
            )}
        </Page>
    );
}

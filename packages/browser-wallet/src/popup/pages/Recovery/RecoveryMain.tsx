import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { networkConfigurationAtom } from '@popup/store/settings';
import {
    identityProvidersAtom,
    isRecoveringAtom,
    recoveryStatusAtom,
    setRecoveryPayloadAtom,
} from '@popup/store/identity';
import PendingArrows from '@assets/svg/pending-arrows.svg';
import { BackgroundResponseStatus } from '@shared/utils/types';
import { getIdentityProviders } from '@popup/shared/utils/wallet-proxy';
import { getGlobal, getNet } from '@shared/utils/network-helpers';
import PageHeader from '@popup/shared/PageHeader';
import { absoluteRoutes } from '@popup/constants/routes';
import { useDecryptedSeedPhrase } from '@popup/shared/utils/seedPhrase-helpers';

export default function RecoveryMain() {
    const { t } = useTranslation('recovery');
    const network = useAtomValue(networkConfigurationAtom);
    const [providers, setProviders] = useAtom(identityProvidersAtom);
    const [isRecovering, setIsRecovering] = useAtom(isRecoveringAtom);
    const recoveryStatus = useAtomValue(recoveryStatusAtom);
    const setRecoveryStatus = useSetAtom(setRecoveryPayloadAtom);
    const [runRecovery, setRunRecovery] = useState<boolean>(true);
    const navigate = useNavigate();

    const onError = useCallback(
        (reason: string) =>
            navigate(absoluteRoutes.prompt.recovery.path, {
                state: { payload: { status: BackgroundResponseStatus.Error, reason } },
            }),
        []
    );
    const seedPhrase = useDecryptedSeedPhrase((e) => onError(e.message));

    useEffect(() => {
        if (runRecovery && !providers.length) {
            getIdentityProviders()
                .then(setProviders)
                .catch(() => onError('Unable to get list of identity providers'));
        }
    }, [runRecovery, providers.length]);

    useEffect(() => {
        if (!runRecovery || isRecovering.loading || !providers.length || !seedPhrase) {
            return;
        }

        setRunRecovery(false);

        if (isRecovering.value) {
            return;
        }

        getGlobal(network)
            .then((global) =>
                setRecoveryStatus({
                    providers,
                    globalContext: global,
                    seedAsHex: seedPhrase,
                    net: getNet(network),
                })
            )
            .then(() => setIsRecovering(true))
            .catch((error) => onError(error.message));
    }, [runRecovery, isRecovering.loading, isRecovering.value, providers.length, seedPhrase]);

    return (
        <>
            <PageHeader>{t('main.title')}</PageHeader>
            <div className="recovery__main onboarding-setup__page-with-header">
                <div className="onboarding-setup__page-with-header__description">{t('main.description')}</div>
                <PendingArrows className="identity-issuance__start__loading-arrows" />
                <p>{recoveryStatus.value?.identityIndex}</p>
                <p>{recoveryStatus.value?.credentialNumber}</p>
                <p>{recoveryStatus.value?.credentialsToAdd?.length}</p>
                <p>{recoveryStatus.value?.identitiesToAdd?.length}</p>
            </div>
        </>
    );
}

import React, { useCallback, useEffect } from 'react';
import { Location, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSetAtom } from 'jotai';

import { InternalMessageType } from '@messaging';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import { LoaderInline } from '@popup/popupX/shared/Loader';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { useDecryptedSeedPhrase } from '@popup/shared/utils/seed-phrase-helpers';
import { logError } from '@shared/utils/log-helpers';
import { IdentityIssuanceRequestPayload } from '@shared/utils/types';
import { pendingIdentityAtom } from '@popup/store/identity';
import { getNet } from '@shared/utils/network-helpers';

import { IdIssuanceFailedLocationState } from './Failed';
import { IdIssuanceExternalFlowLocationState } from './util';

export default function IdIssuanceExternalFlow() {
    const { state, pathname } = useLocation() as Location & { state: IdIssuanceExternalFlowLocationState | undefined };
    const { t } = useTranslation('x', { keyPrefix: 'idIssuance.externalFlow' });
    const updatePendingIdentity = useSetAtom(pendingIdentityAtom);
    const nav = useNavigate();

    const handleError = useCallback(
        (message: string) => {
            const messageState: IdIssuanceFailedLocationState = { message, backState: state };
            nav(absoluteRoutes.settings.identities.create.failed.path, { state: messageState, replace: true });
        },
        [state]
    );

    const seedPhrase = useDecryptedSeedPhrase((e) => handleError(e.message));

    const start = useCallback(async () => {
        if (state === undefined) throw new Error('Location state not available');
        if (seedPhrase === undefined) throw new Error('Seed phrase not available');

        updatePendingIdentity(state.pendingIdentity);

        const issuanceRequest: IdentityIssuanceRequestPayload = {
            globalContext: state.global,
            ipInfo: state.provider.ipInfo,
            arsInfos: state.provider.arsInfos,
            net: getNet(state.pendingIdentity.network),
            identityIndex: state.pendingIdentity.identity.index,
            arThreshold: Math.min(Object.keys(state.provider.arsInfos).length - 1, 255),
            baseUrl: state.provider.metadata.issuanceStart,
            seed: seedPhrase,
        };

        const response = await popupMessageHandler.sendInternalMessage(
            InternalMessageType.StartIdentityIssuance,
            issuanceRequest
        );

        if (!response) {
            logError('Failed to issue identity due to internal error');
            handleError('Internal error, please try again.');
        } else {
            nav(pathname, { state: undefined, replace: true }); // This ensures that when we navigate back, we don't try again automatically.
        }
    }, [state, seedPhrase, handleError]);

    useEffect(() => {
        if (state !== undefined && seedPhrase !== undefined) {
            start();
        }
    }, [start]);

    if (state === undefined) {
        return <Navigate to={absoluteRoutes.settings.identities.create.path} />;
    }

    return (
        <Page>
            <Page.Top />
            <Text.Capture className="text-center">{t('description')}</Text.Capture>
            <LoaderInline className="m-t-50 margin-center" />
        </Page>
    );
}

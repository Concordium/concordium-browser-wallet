/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useEffect } from 'react';
import {
    ConcordiumHdWallet,
    CryptographicParameters,
    IdObjectRequestV1,
    IdentityRequestWithKeysInput,
    Versioned,
    CredentialInput,
    getAccountAddress,
    createCredentialTransaction,
    signCredentialTransaction,
    TransactionExpiry,
    getCredentialDeploymentTransactionHash,
} from '@concordium/web-sdk';
import { Location, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSetAtom } from 'jotai';
import { InternalMessageType } from '@messaging';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import { LoaderInline } from '@popup/popupX/shared/Loader';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { logError } from '@shared/utils/log-helpers';
import { pendingIdentityAtom } from '@popup/store/identity';
import { getNet } from '@shared/utils/network-helpers';
import Button from '@popup/popupX/shared/Button';
import { getPublicKey } from '@popup/shared/utils/ledger-helpers';

import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import ConcordiumApp from '@blooo/hw-app-concordium';
import { IdIssuanceFailedLocationState } from './Failed';
import { IdIssuanceExternalFlowLocationState } from './util';

export default function IdIssuanceExternalFlowLedger() {
    const { state } = useLocation() as Location & { state: IdIssuanceExternalFlowLocationState };
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

    const start = useCallback(async () => {
        updatePendingIdentity(state.pendingIdentity);

        const identityProviderIndex = state.pendingIdentity.identity.index;

        const fetchPublicKey = async () => {
            try {
                const key = await getPublicKey(
                    state.pendingIdentity.identity.index ?? 0,
                    state.pendingIdentity.identity.providerIndex ?? 0
                );
                const formattedKey = key.match(/.{1,16}/g)?.join('\n') || key;
                console.log(formattedKey);
                // setPublicKey(formattedKey);
            } catch (err: unknown) {
                // setError('Please check if your Ledger device is connected and the Concordium app is open.');
            }
        };
        const idCredSec = localStorage.getItem('idCredSec');
        const prfKey = localStorage.getItem('prfKey');
        const blindingRandomness = wallet
            .getSignatureBlindingRandomness(identityProviderIndex, identityIndex)
            .toString('hex');

        if (!idCredSec || !prfKey) {
            handleError('Missing required identity keys. Please try again.');
            return;
        }

        const identityRequestInput: IdentityRequestWithKeysInput = {
            arsInfos: state.provider.arsInfos,
            arThreshold: Math.min(Object.keys(state.provider.arsInfos).length - 1, 255),
            ipInfo: state.provider.ipInfo,
            globalContext: state.global,
            idCredSec,
            prfKey,
            blindingRandomness,
        };

        /* const issuanceRequest: IdentityIssuanceRequestPayloadLedger = {
            globalContext: state.global,
            ipInfo: state.provider.ipInfo,
            arsInfos: state.provider.arsInfos,
            net: getNet(state.pendingIdentity.network),
            identityIndex: state.pendingIdentity.identity.index,
            arThreshold: Math.min(Object.keys(state.provider.arsInfos).length - 1, 255),
            baseUrl: state.provider.metadata.issuanceStart,
            prfKey: seedPhrase.prfKey,
            idCredSec: seedPhrase.idCredSec,
            blindingRandomness: seedPhrase.blindingRandomness,
        }; */

        const response = await popupMessageHandler.sendInternalMessage(
            InternalMessageType.StartIdentityIssuance,
            issuanceRequest
        );

        if (!response) {
            logError('Failed to issue identity due to internal error');
            handleError('Internal error, please try again.');
        } else {
            nav(absoluteRoutes.settings.identities.path, { replace: true });
        }
    }, [state, handleError]);

    useEffect(() => {
        if (state !== null) {
            start();
        }
    }, [start]);

    return (
        <Page>
            <Page.Top />
            <Text.Capture className="text-center">{t('description')}</Text.Capture>
            <LoaderInline className="m-t-50 margin-center" />
            <Page.Footer>
                <Button.Main label={t('buttonReset')} />
            </Page.Footer>
        </Page>
    );
}

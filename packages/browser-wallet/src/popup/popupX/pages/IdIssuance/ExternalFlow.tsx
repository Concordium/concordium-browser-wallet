import React, { useCallback, useEffect, useState } from 'react';
import { Location, Navigate, useLocation } from 'react-router-dom';

import { InternalMessageType } from '@messaging';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import Button from '@popup/popupX/shared/Button';
import FullscreenNotice, { FullscreenNoticeProps } from '@popup/popupX/shared/FullscreenNotice';
import { LoaderInline } from '@popup/popupX/shared/Loader';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { useDecryptedSeedPhrase } from '@popup/shared/utils/seed-phrase-helpers';
import { logError } from '@shared/utils/log-helpers';
import { IdentityIssuanceRequestPayload } from '@shared/utils/types';

type ErrorNoticeProps = Pick<FullscreenNoticeProps, 'onClose'> & { message: string | undefined; onRetry(): void };

// TODO: translations...
function ErrorNotice({ onClose, message, onRetry }: ErrorNoticeProps) {
    return (
        <FullscreenNotice open={message !== undefined} onClose={onClose}>
            <Page>
                <Page.Top heading="Error" />
                <Text.Capture>{message}</Text.Capture>
                <Page.Footer>
                    <Button.Main label="Try again" onClick={onRetry} />
                </Page.Footer>
            </Page>
        </FullscreenNotice>
    );
}

/** The necessary state for the {@linkcode IdIssuanceExternalFlow} page. */
export type IdIssuanceExternalFlowLocationState = Omit<IdentityIssuanceRequestPayload, 'seed'>;

export default function IdIssuanceExternalFlow() {
    const { state } = useLocation() as Location & { state: IdIssuanceExternalFlowLocationState | undefined };
    const [error, setError] = useState<string | undefined>();
    const seedPhrase = useDecryptedSeedPhrase((e) => setError(e.message));

    const start = useCallback(async () => {
        if (state === undefined) throw new Error('Location state not available');
        if (seedPhrase === undefined) throw new Error('Seed phrase not available');

        const response = await popupMessageHandler.sendInternalMessage(InternalMessageType.StartIdentityIssuance, {
            ...state,
            seed: seedPhrase,
        });
        if (!response) {
            logError('Failed to issue identity due to internal error');
            throw new Error('Internal error, please try again.');
        }
    }, [state, seedPhrase]);

    useEffect(() => {
        if (state !== undefined && seedPhrase !== undefined) {
            start();
        }
    }, [start]);

    if (state === undefined) {
        return <Navigate to={absoluteRoutes.settings.identities.create.path} />;
    }

    return (
        <>
            <ErrorNotice onClose={() => setError(undefined)} message={error} onRetry={start} />
            <Page>
                <Page.Top heading=" " />
                <Text.Capture className="text-center">
                    Your request is being built. Please do not close the browser. When a new tab opens from the identity
                    provider please follow their process to create your identity.
                </Text.Capture>
                <LoaderInline className="m-t-50 margin-center" />
            </Page>
        </>
    );
}

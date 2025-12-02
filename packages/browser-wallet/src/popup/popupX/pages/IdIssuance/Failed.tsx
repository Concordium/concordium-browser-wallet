import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Location, useLocation, useNavigate } from 'react-router-dom';

import { absoluteRoutes } from '@popup/popupX/constants/routes';
import Button from '@popup/popupX/shared/Button';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';

import { IdIssuanceExternalFlowLocationState } from './util';

export type IdIssuanceFailedLocationState = { message: string; backState?: IdIssuanceExternalFlowLocationState };

export default function IdIssuanceFailed() {
    const { t } = useTranslation('x', { keyPrefix: 'idIssuance.failed' });
    const { state } = useLocation() as Location & { state: IdIssuanceFailedLocationState };
    const nav = useNavigate();

    const handleRetry = useCallback(() => {
        if (state.backState !== undefined) {
            nav(absoluteRoutes.settings.identities.create.externalFlow.path, { state: state.backState, replace: true });
        } else {
            nav(absoluteRoutes.settings.identities.create.path, { replace: true });
        }
    }, [state.backState]);

    return (
        <Page className="id-issuance-failed">
            <Page.Top heading={t('title')} />
            <Text.Capture>{state.message}</Text.Capture>
            <Page.Footer>
                <Button.Main label={t('buttonRetry')} onClick={handleRetry} />
            </Page.Footer>
        </Page>
    );
}

import React from 'react';
import { Location, Navigate, useLocation } from 'react-router-dom';

import { absoluteRoutes } from '@popup/popupX/constants/routes';
import { IdentityIssuanceBackgroundResponse } from '@shared/utils/identity-helpers';
import { BackgroundResponseStatus } from '@shared/utils/types';
import { useTranslation } from 'react-i18next';
import { WalletEvent } from '@messaging';

export default function EndIdentityIssuance() {
    const {
        state: { payload },
    } = useLocation() as Location & {
        state: WalletEvent & { payload: IdentityIssuanceBackgroundResponse };
    };
    const { t } = useTranslation('x', { keyPrefix: 'idIssuance.aborted' });

    switch (payload.status) {
        case BackgroundResponseStatus.Success:
            return <Navigate to={absoluteRoutes.settings.identities.create.submitted.path} replace />;
        case BackgroundResponseStatus.Error:
            return (
                <Navigate
                    to={absoluteRoutes.settings.identities.create.failed.path}
                    replace
                    state={{ message: payload.reason }}
                />
            );
        case BackgroundResponseStatus.Aborted:
            return (
                <Navigate
                    to={absoluteRoutes.settings.identities.create.failed.path}
                    replace
                    state={{ message: t('message') }}
                />
            );
        default:
            throw new Error('Unsupported status from background');
    }
}

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';

import Button from '@popup/popupX/shared/Button';
import { ConfirmedIdCard, PendingIdCard, RejectedIdCard } from '@popup/popupX/shared/IdCard';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import { identitiesAtomWithLoading } from '@popup/store/identity';
import { CreationStatus } from '@shared/storage/types';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import { isSpawnedWindow } from '@popup/shared/window-helpers';
import { useNavigate } from 'react-router-dom';
import appTracker from '@shared/analytics';

export default function IdIssuanceSubmitted() {
    const { t } = useTranslation('x', { keyPrefix: 'idIssuance.submitted' });
    const { loading, value: identities } = useAtomValue(identitiesAtomWithLoading);
    const nav = useNavigate();

    useEffect(() => {
        appTracker.identityVerificationResultScreen();
    }, []);

    if (loading) {
        return null;
    }

    const identity = identities.slice(-1)[0];

    const handleDone = () => {
        if (isSpawnedWindow) {
            window.close();
        } else {
            nav(absoluteRoutes.home.path, { replace: true });
        }

        if (identity.status === CreationStatus.Confirmed) {
            appTracker.identityVerificationResultApprovedDialog();
        }
    };

    return (
        <Page>
            <Page.Top heading={t('title')} />
            <Text.Capture>{t('description')}</Text.Capture>
            <div className="m-t-20">
                {identity.status === CreationStatus.Pending && <PendingIdCard identity={identity} />}
                {identity.status === CreationStatus.Rejected && <RejectedIdCard identity={identity} />}
                {identity.status === CreationStatus.Confirmed && <ConfirmedIdCard identity={identity} />}
            </div>
            <Page.Footer>
                <Button.Main className="m-t-20" label={t('buttonContinue')} onClick={handleDone} />
            </Page.Footer>
        </Page>
    );
}

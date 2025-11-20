import React from 'react';
import { useTranslation } from 'react-i18next';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import FullscreenNotice from '@popup/popupX/shared/FullscreenNotice';
import { useLocation } from 'react-router-dom';

export default function IdCardsInfo() {
    const { t } = useTranslation('x', { keyPrefix: 'idIssuance.idCardsInfo' });

    return (
        <Page className="id-cards-info">
            <Page.Top heading={t('ids')} />
            <Page.Main>
                <Text.Capture>{t('idDescription')}</Text.Capture>
            </Page.Main>
        </Page>
    );
}

export function IdCardsInfoNotice({ ...props }: { open: boolean; onClose: () => void }) {
    const { pathname } = useLocation();
    const isAtOnboarding = pathname.includes('onboarding');
    return (
        <FullscreenNotice hideConnection={isAtOnboarding} {...props}>
            <IdCardsInfo />
        </FullscreenNotice>
    );
}

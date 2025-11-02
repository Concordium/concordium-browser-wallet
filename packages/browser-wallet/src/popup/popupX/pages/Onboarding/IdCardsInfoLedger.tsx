import React from 'react';
import Button from '@popup/popupX/shared/Button';
import { useNavigate } from 'react-router-dom';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import { useTranslation } from 'react-i18next';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';

export default function IdCardsInfoLedger() {
    const { t } = useTranslation('x', { keyPrefix: 'onboarding.idCardsInfo' });
    const nav = useNavigate();
    const navToNext = () =>
        nav(
            absoluteRoutes.onboarding.setupPassword.createOrRestore.selectIdentityProvider.path
            // absoluteRoutes.onboarding.setupPassword.createOrRestore.generateSeedPhrase.confirmSeedPhrase.idIntro.requestIdentity.path
        );
    return (
        <Page className="id-cards-info">
            <Page.Top heading={t('ids')} />
            <Page.Main>
                <Text.Capture>{t('idDescription')}</Text.Capture>
            </Page.Main>
            <Page.Footer>
                <Button.Main label={t('request')} onClick={() => navToNext()} />
            </Page.Footer>
        </Page>
    );
}

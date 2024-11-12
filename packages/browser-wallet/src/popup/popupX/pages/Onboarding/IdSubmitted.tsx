import React from 'react';
import Button from '@popup/popupX/shared/Button';
import { useNavigate } from 'react-router-dom';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import { useTranslation } from 'react-i18next';
import IdCard from '@popup/popupX/shared/IdCard';
import { IdCardAttributeInfo } from '@popup/popupX/shared/IdCard/IdCard';

const rowsIdInfo: IdCardAttributeInfo[] = [
    { key: 'Identity document type', value: 'Drivers licence' },
    { key: 'Identity document number', value: 'BXM680515' },
];

export default function IdSubmitted() {
    const { t } = useTranslation('x', { keyPrefix: 'onboarding.idSubmitted' });
    const nav = useNavigate();
    const navToNext = () => nav(`../../home`);
    return (
        <Page className="id-submitted">
            <Page.Top heading={t('yourId')} />
            <Page.Main>
                <Text.Capture>{t('idSubmitInfo')}</Text.Capture>
                <IdCard rowsIdInfo={rowsIdInfo} idProviderName="TODO" identityName="TODO" />
            </Page.Main>
            <Page.Footer>
                <Button.Main label={t('done')} onClick={() => navToNext()} />
            </Page.Footer>
        </Page>
    );
}
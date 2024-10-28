import React from 'react';
import ArrowRight from '@assets/svgX/arrow-right.svg';
import Button from '@popup/popupX/shared/Button';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import { useTranslation } from 'react-i18next';
import IdCard from '@popup/popupX/shared/IdCard';
import { IdCardAttributeInfo } from '@popup/popupX/shared/IdCard/IdCard';

function AccountLink({ account, balance }: { account: string; balance: string }) {
    return (
        <div className="account-link">
            <Text.Capture>{account}</Text.Capture>
            {balance}
            <Button.Icon className="transparent" icon={<ArrowRight />} />
        </div>
    );
}

const rowsIdInfo: IdCardAttributeInfo[] = [
    { key: '', value: <AccountLink account="Accout 1 / 6gk...k7o" balance="1,285,700 CCD" /> },
    { key: '', value: <AccountLink account="Accout 2 / tt2...50eo" balance="90,800 CCD" /> },
];

export default function RestoreResult() {
    const { t } = useTranslation('x', { keyPrefix: 'restore' });

    return (
        <Page className="restore-result-x">
            <Page.Top heading={t('result')} />
            <Page.Main>
                <Text.Capture>{t('recoveredIds')}</Text.Capture>
                <IdCard rowsIdInfo={rowsIdInfo} idProviderName="TODO" identityName="TODO" />
            </Page.Main>
            <Page.Footer>
                <Button.Main label={t('continue')} />
            </Page.Footer>
        </Page>
    );
}

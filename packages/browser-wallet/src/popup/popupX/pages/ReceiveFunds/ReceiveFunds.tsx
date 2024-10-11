import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@popup/popupX/shared/Button';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import Card from '@popup/popupX/shared/Card';
import { useAtomValue } from 'jotai';
import { selectedAccountAtom } from '@popup/store/account';
import { DisplayAsQR } from 'wallet-common-helpers';

export default function ReceiveFunds() {
    const { t } = useTranslation('x', { keyPrefix: 'receiveFunds' });
    const address = useAtomValue(selectedAccountAtom);

    if (address === undefined) {
        return null;
    }

    return (
        <Page className="receive-funds">
            <Page.Top heading={t('receiveFunds')}>
                <Text.Capture>{t('to', { value: 'Account 1 / 6gk...Fk7o' })}</Text.Capture>
            </Page.Top>
            <Page.Main>
                <Card type="gradient">
                    <DisplayAsQR value={address} bgColor="transparent" className="qr-card" />
                    <Text.Main>{address}</Text.Main>
                    <Button.Secondary label={t('copyAddress')} onClick={() => {}} />
                </Card>
            </Page.Main>
        </Page>
    );
}

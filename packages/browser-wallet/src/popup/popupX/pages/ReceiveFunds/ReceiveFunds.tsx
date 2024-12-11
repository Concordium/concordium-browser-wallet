import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@popup/popupX/shared/Button';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import Card from '@popup/popupX/shared/Card';
import { useAtomValue } from 'jotai';
import { selectedCredentialAtom } from '@popup/store/account';
import { DisplayAsQR } from 'wallet-common-helpers';
import { displayNameAndSplitAddress } from '@popup/shared/utils/account-helpers';
import { useCopyAddress } from '@popup/popupX/shared/utils/hooks';

export default function ReceiveFunds() {
    const { t } = useTranslation('x', { keyPrefix: 'receiveFunds' });
    const credential = useAtomValue(selectedCredentialAtom);
    const copyAddressToClipboard = useCopyAddress();

    if (credential === undefined) {
        return null;
    }

    return (
        <Page className="receive-funds">
            <Page.Top heading={t('receiveFunds')}>
                <Text.Capture>{t('to', { value: displayNameAndSplitAddress(credential) })}</Text.Capture>
            </Page.Top>
            <Page.Main>
                <Card type="gradient">
                    <DisplayAsQR value={credential.address} bgColor="transparent" className="qr-card" />
                    <Text.Main>{credential.address}</Text.Main>
                    <Button.Secondary
                        label={t('copyAddress')}
                        onClick={() => copyAddressToClipboard(credential.address)}
                    />
                </Card>
            </Page.Main>
        </Page>
    );
}

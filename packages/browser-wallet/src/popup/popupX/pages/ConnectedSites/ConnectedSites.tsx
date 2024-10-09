import React from 'react';
import Page from '@popup/popupX/shared/Page';
import { useTranslation } from 'react-i18next';
import Text from '@popup/popupX/shared/Text';
import Card from '@popup/popupX/shared/Card';
import Button from '@popup/popupX/shared/Button';

export default function ConnectedSites() {
    const { t } = useTranslation('x', { keyPrefix: 'connectedSites' });
    return (
        <Page className="connected-sites-x">
            <Page.Top heading={t('connectedSites')}>
                <Text.Capture>Accout 1 / 6gk...Fk7o</Text.Capture>
            </Page.Top>
            <Page.Main>
                <Card>
                    <Card.Row>
                        <Text.MainRegular>concordium.com</Text.MainRegular>
                        <Button.Secondary className="dark" label={t('disconnect')} />
                    </Card.Row>
                    <Card.Row>
                        <Text.MainRegular>app.uniswap.org</Text.MainRegular>
                        <Button.Secondary className="dark" label={t('disconnect')} />
                    </Card.Row>
                    <Card.Row>
                        <Text.MainRegular>binance.com</Text.MainRegular>
                        <Button.Secondary className="dark" label={t('disconnect')} />
                    </Card.Row>
                </Card>
            </Page.Main>
        </Page>
    );
}

import React from 'react';
import Page from '@popup/popupX/shared/Page';
import { useTranslation } from 'react-i18next';
import Text from '@popup/popupX/shared/Text';
import Card from '@popup/popupX/shared/Card';
import Button from '@popup/popupX/shared/Button';
import Copy from '@assets/svgX/copy.svg';

export default function PrivateKey() {
    const { t } = useTranslation('x', { keyPrefix: 'privateKey' });
    return (
        <Page className="account-private-key-x">
            <Page.Top heading={t('accountPrivateKey')} />
            <Page.Main>
                <Text.Capture>{t('keyDescription')}</Text.Capture>
                <Card>
                    <Text.LabelRegular>
                        575f0f919c99ed4b7d858df2aea68112292da4eae98e2e69410cd5283f3c727b282caeba754f815dc876d8b84d3339c6f74c4127f238a391891dd23c74892943
                    </Text.LabelRegular>
                </Card>
                <Button.IconText label={t('copyKey')} icon={<Copy />} />
            </Page.Main>
            <Page.Footer>
                <Button.Main label={t('export')} />
            </Page.Footer>
        </Page>
    );
}

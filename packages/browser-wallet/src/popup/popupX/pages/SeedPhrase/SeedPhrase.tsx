import React from 'react';
import Button from '@popup/popupX/shared/Button';
import { useTranslation } from 'react-i18next';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import Card from '@popup/popupX/shared/Card';
import Copy from '@assets/svgX/copy.svg';

const RECOVERY_PHRASE =
    'meadow salad weather rural next promote fence mass leopard mail regret mushroom love coral viable layer lumber soft setup radar oppose miracle rural agree'.split(
        ' '
    );

export default function SeedPhrase() {
    const { t } = useTranslation('x', { keyPrefix: 'seedPhrase' });

    return (
        <Page className="seed-phrase-x">
            <Page.Top heading={t('seedPhrase')} />
            <Page.Main>
                <Text.Capture>{t('seedPhraseDescription')}</Text.Capture>
                <Card>
                    {RECOVERY_PHRASE.map((word) => (
                        <Text.LabelRegular>{word}</Text.LabelRegular>
                    ))}
                </Card>
                <Button.IconText icon={<Copy />} label={t('copy')} />
            </Page.Main>
        </Page>
    );
}

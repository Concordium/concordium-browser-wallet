import React from 'react';
import Button from '@popup/popupX/shared/Button';
import { useTranslation } from 'react-i18next';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import Card from '@popup/popupX/shared/Card';
import Copy from '@assets/svgX/copy.svg';
import { useAsyncMemo } from 'wallet-common-helpers';
import { decrypt } from '@shared/utils/crypto';
import { useAtomValue } from 'jotai';
import { encryptedSeedPhraseAtom, sessionPasscodeAtom } from '@popup/store/settings';
import { copyToClipboard } from '@popup/popupX/shared/utils/helpers';
import { withPasswordProtected } from '@popup/popupX/shared/utils/hoc';

function SeedPhrase() {
    const { t } = useTranslation('x', { keyPrefix: 'seedPhrase' });
    const passcode = useAtomValue(sessionPasscodeAtom);
    const encryptedSeed = useAtomValue(encryptedSeedPhraseAtom);

    const seedPhrase = useAsyncMemo(
        async () => {
            if (encryptedSeed.loading || passcode.loading) {
                return undefined;
            }
            if (encryptedSeed.value && passcode.value) {
                return decrypt(encryptedSeed.value, passcode.value);
            }
            throw new Error('SeedPhrase should not be retrieved without unlocking the wallet.');
        },
        undefined,
        [encryptedSeed.loading, passcode.loading]
    );

    if (!seedPhrase) return null;

    return (
        <Page className="seed-phrase-x">
            <Page.Top heading={t('seedPhrase')} />
            <Page.Main>
                <Text.Capture>{t('seedPhraseDescription')}</Text.Capture>
                <Card>
                    {seedPhrase.split(' ').map((word) => (
                        <Text.LabelRegular key={word}>{word}</Text.LabelRegular>
                    ))}
                </Card>
                <Button.IconText icon={<Copy />} label={t('copy')} onClick={() => copyToClipboard(seedPhrase)} />
            </Page.Main>
        </Page>
    );
}

export default withPasswordProtected(SeedPhrase, {
    headingKey: 'seedPhrase.seedPhrase',
    pageInfoKey: 'seedPhrase.passwordDescription',
    submitKey: 'seedPhrase.showSeedPhrase',
});

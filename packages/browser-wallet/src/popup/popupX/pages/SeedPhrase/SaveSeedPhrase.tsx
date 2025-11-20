import React from 'react';
import Button from '@popup/popupX/shared/Button';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import Card from '@popup/popupX/shared/Card';
import Copy from '@assets/svgX/UiKit/Interface/copy-duplicate.svg';
import { useAsyncMemo } from 'wallet-common-helpers';
import { decrypt } from '@shared/utils/crypto';
import { useAtomValue, useSetAtom } from 'jotai';
import { encryptedSeedPhraseAtom, hasBeenSavedSeedAtom, sessionPasscodeAtom } from '@popup/store/settings';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import { useCopyToClipboard } from '@popup/popupX/shared/utils/hooks';

function SaveSeedPhrase() {
    const { t } = useTranslation('x', { keyPrefix: 'seedPhrase' });
    const nav = useNavigate();
    const passcode = useAtomValue(sessionPasscodeAtom);
    const encryptedSeed = useAtomValue(encryptedSeedPhraseAtom);
    const setHasBeenSavedSeed = useSetAtom(hasBeenSavedSeedAtom);
    const copyToClipboard = useCopyToClipboard();

    const navToHome = () => nav(absoluteRoutes.home.path);

    const onConfirmSave = () => {
        setHasBeenSavedSeed(true).then(() => navToHome());
    };

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
        <Page className="seed-phrase-x save-seed-phrase">
            <Page.Top heading={t('secureSeedPhrase')} />
            <Page.Main>
                <Text.Capture>{t('secureSeedPhraseDescription')}</Text.Capture>
                <Card>
                    {seedPhrase.split(' ').map((word) => (
                        <Text.LabelRegular key={word}>{word} </Text.LabelRegular>
                    ))}
                </Card>
                <Button.Tertiary iconLeft={<Copy />} label={t('copy')} onClick={() => copyToClipboard(seedPhrase)} />
            </Page.Main>
            <Page.Footer>
                <Button.Main label={t('haveSavedSeedPhrase')} onClick={onConfirmSave} />
            </Page.Footer>
        </Page>
    );
}

export default SaveSeedPhrase;

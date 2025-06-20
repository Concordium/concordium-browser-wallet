import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { encryptedSeedPhraseAtom, sessionOnboardingLocationAtom, sessionPasscodeAtom } from '@popup/store/settings';
import { decrypt, encrypt } from '@shared/utils/crypto';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import Button from '@popup/popupX/shared/Button';
import { SeedPhrase } from '@popup/popupX/shared/Form/SeedPhrase';
import appTracker from '@shared/analytics';

export default function GenerateSeedPhrase() {
    const nav = useNavigate();
    const location = useLocation();
    const { t } = useTranslation('x', { keyPrefix: 'onboarding.generateSeedPhrase' });
    const [seedPhrase, setSeedPhrase] = useState<string>();
    const [encryptedSeedPhrase, setEncryptedSeedPhrase] = useAtom(encryptedSeedPhraseAtom);
    const setOnboardingLocation = useSetAtom(sessionOnboardingLocationAtom);
    const sessionPasscode = useAtomValue(sessionPasscodeAtom);
    const passcode = sessionPasscode.value;

    const navToConfirmSeed = () =>
        nav(absoluteRoutes.onboarding.setupPassword.createOrRestore.generateSeedPhrase.confirmSeedPhrase.path);

    useEffect(() => {
        appTracker.seedPhraseScreen();
    }, []);

    useEffect(() => {
        if (!encryptedSeedPhrase.loading && encryptedSeedPhrase.value === undefined && passcode) {
            const newSeedPhrase = generateMnemonic(wordlist, 256);
            encrypt(newSeedPhrase, passcode).then((newEncryptedSeedPhrase) => {
                setEncryptedSeedPhrase(newEncryptedSeedPhrase);
                setSeedPhrase(newSeedPhrase);
                setOnboardingLocation(location.pathname);
            });
        }
    }, [encryptedSeedPhrase.loading, encryptedSeedPhrase.value, passcode]);

    useEffect(() => {
        if (!seedPhrase && !encryptedSeedPhrase.loading && encryptedSeedPhrase.value && passcode) {
            decrypt(encryptedSeedPhrase.value, passcode).then(setSeedPhrase);
        }
    }, [seedPhrase, encryptedSeedPhrase.loading, encryptedSeedPhrase.value, passcode]);

    return (
        <Page className="generate-seed-phrase">
            <Page.Top heading={t('yourRecoveryPhrase')} />
            <Page.Main>
                <Text.Capture>{t('writeDown')}</Text.Capture>
                {seedPhrase && (
                    <SeedPhrase name="recovery-phrase" value={seedPhrase} initialValue={seedPhrase} readOnly />
                )}
            </Page.Main>
            <Page.Footer>
                <Button.Main label={t('continue')} onClick={() => navToConfirmSeed()} />
            </Page.Footer>
        </Page>
    );
}

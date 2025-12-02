import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Page from '@popup/popupX/shared/Page';
import Button from '@popup/popupX/shared/Button';
import Text from '@popup/popupX/shared/Text';
import SeedPhrase from '@popup/popupX/shared/Form/SeedPhrase';
import Form from '@popup/popupX/shared/Form';
import { useSetAtom } from 'jotai';
import { encryptedSeedPhraseAtom, hasBeenOnBoardedAtom, hasBeenSavedSeedAtom } from '@popup/store/settings';
import { usePasscodeInSetup } from '@popup/pages/Setup/passcode-helper';
import { Validate } from 'react-hook-form';
import { encrypt } from '@shared/utils/crypto';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import { validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { useForm } from '@popup/shared/Form';

type FormValues = {
    seedPhraseInput: string;
};

const validateWordCount = (seedPhrase: string) => seedPhrase.split(' ').length === 24;

const validateSeedPhrase =
    (message: string): Validate<string> =>
    (seedPhrase) =>
        !!(validateWordCount(seedPhrase) && validateMnemonic(seedPhrase, wordlist)) || message;
export default function RestoreWallet() {
    const { t } = useTranslation('x', { keyPrefix: 'onboarding.restoreWallet' });
    const nav = useNavigate();
    const setEncryptedSeedPhrase = useSetAtom(encryptedSeedPhraseAtom);
    const setHasBeenOnboarded = useSetAtom(hasBeenOnBoardedAtom);
    const setHasBeenSavedSeed = useSetAtom(hasBeenSavedSeedAtom);
    const form = useForm<FormValues>();
    const passcode = usePasscodeInSetup();

    if (!passcode) {
        // This page should not be shown without the passcode in state.
        return null;
    }

    const handleSubmit = async ({ seedPhraseInput }: FormValues) => {
        const encryptedSeedPhrase = await encrypt(seedPhraseInput, passcode);
        await setEncryptedSeedPhrase(encryptedSeedPhrase);
        await setHasBeenSavedSeed(true);
        setHasBeenOnboarded(true).then(() => {
            const chooseNetworkPathRecovering = absoluteRoutes.settings.restore.main.path;
            nav(chooseNetworkPathRecovering);
        });
    };
    return (
        <Page className="restore-wallet">
            <Page.Top heading={t('restoreWallet')} />
            <Page.Main>
                <Text.Capture>{t('restoreInfo')}</Text.Capture>
                <Form id="restore-wallet-form" formMethods={form} onSubmit={handleSubmit}>
                    {(f) => (
                        <SeedPhrase
                            control={f.control}
                            name="seedPhraseInput"
                            rules={{
                                required: t('required'),
                                validate: validateSeedPhrase(t('validate')),
                            }}
                        />
                    )}
                </Form>
            </Page.Main>
            <Page.Footer>
                <Button.Main form="restore-wallet-form" type="submit" label={t('continue')} />
            </Page.Footer>
        </Page>
    );
}

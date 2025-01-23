import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import { useAtomValue, useSetAtom } from 'jotai';
import Form from '@popup/popupX/shared/Form';
import { SubmitHandler, Validate } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { decrypt } from '@shared/utils/crypto';
import {
    encryptedSeedPhraseAtom,
    hasBeenOnBoardedAtom,
    sessionOnboardingLocationAtom,
    sessionPasscodeAtom,
} from '@popup/store/settings';
import SeedPhrase from '@popup/popupX/shared/Form/SeedPhrase';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import Button from '@popup/popupX/shared/Button';

type FormValues = {
    seedPhraseInput: string;
};

export default function ConfirmSeedPhrase() {
    const navigate = useNavigate();
    const { t } = useTranslation('x', { keyPrefix: 'onboarding.confirmSeedPhrase' });
    const sessionPasscode = useAtomValue(sessionPasscodeAtom);
    const passcode = sessionPasscode.value;
    const encryptedSeedPhrase = useAtomValue(encryptedSeedPhraseAtom);
    const [seedPhrase, setSeedPhrase] = useState<string>();
    const setOnboardingLocation = useSetAtom(sessionOnboardingLocationAtom);
    const setHasBeenOnboarded = useSetAtom(hasBeenOnBoardedAtom);

    useEffect(() => {
        if (!encryptedSeedPhrase.loading && encryptedSeedPhrase.value && passcode) {
            decrypt(encryptedSeedPhrase.value, passcode).then(setSeedPhrase);
        }
    }, [encryptedSeedPhrase.loading, encryptedSeedPhrase.value, passcode]);

    if (!passcode || encryptedSeedPhrase.loading || !encryptedSeedPhrase.value) {
        // This page should not be shown without the passcode or encrypted seed phrase in state.
        return null;
    }

    const handleSubmit: SubmitHandler<FormValues> = () => {
        const idIntro =
            absoluteRoutes.onboarding.setupPassword.createOrRestore.generateSeedPhrase.confirmSeedPhrase.idIntro.path;
        setOnboardingLocation(idIntro);
        setHasBeenOnboarded(true);
        navigate(idIntro);
    };

    function validateSeedPhrase(): Validate<string> {
        return (seedPhraseValue) => (seedPhraseValue !== seedPhrase ? t('validate') : undefined);
    }

    return (
        <Page className="restore-wallet">
            <Page.Top heading={t('yourRecoveryPhrase')} />
            <Page.Main>
                <Text.Capture>{t('enterSeed')}</Text.Capture>
                <Form<FormValues> id="confirm-seed-form" onSubmit={handleSubmit}>
                    {(f) => (
                        <SeedPhrase
                            control={f.control}
                            name="seedPhraseInput"
                            rules={{
                                required: t('required'),
                                validate: validateSeedPhrase(),
                            }}
                            onPaste={(e) => {
                                e.preventDefault();
                                return false;
                            }}
                        />
                    )}
                </Form>
            </Page.Main>
            <Page.Footer>
                <Button.Main form="confirm-seed-form" type="submit" label={t('continue')} />
            </Page.Footer>
        </Page>
    );
}

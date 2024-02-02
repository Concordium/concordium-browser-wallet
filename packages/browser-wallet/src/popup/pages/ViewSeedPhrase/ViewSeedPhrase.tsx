import Button from '@popup/shared/Button';
import CopyButton from '@popup/shared/CopyButton';
import Form from '@popup/shared/Form';
import FormPassword from '@popup/shared/Form/Password';
import Submit from '@popup/shared/Form/Submit';
import { TextArea } from '@popup/shared/Form/TextArea';
import { encryptedSeedPhraseAtom, sessionPasscodeAtom } from '@popup/store/settings';
import { useAtomValue } from 'jotai';
import React, { useState } from 'react';
import { Validate } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { absoluteRoutes } from '@popup/constants/routes';
import { useAsyncMemo } from 'wallet-common-helpers';
import { decrypt } from '@shared/utils/crypto';

export default function ViewSeedPhrase() {
    const nav = useNavigate();
    const { t: tSetup } = useTranslation('setup');
    const { t: tPasscode } = useTranslation('changePasscode');
    const { t } = useTranslation('viewSeedPhrase');
    const passcode = useAtomValue(sessionPasscodeAtom);
    const [showSeedPhrase, setShowSeedPhrase] = useState<boolean>(false);
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

    const handleSubmit = () => {
        setShowSeedPhrase(true);
    };

    function validateCurrentPasscode(): Validate<string> {
        return (currentPasscode) => (currentPasscode !== passcode.value ? tPasscode('incorrectPasscode') : undefined);
    }

    if (showSeedPhrase) {
        return (
            <div className="view-seed-phrase-page">
                <div className="view-seed-phrase-page__description">{t('copyDescription')}</div>
                {seedPhrase && (
                    <div className="relative">
                        <TextArea value={seedPhrase} readOnly />
                        <CopyButton className="view-seed-phrase-page__copy" value={seedPhrase} />
                    </div>
                )}
                <Button
                    className="view-seed-phrase-page__button"
                    width="medium"
                    onClick={() => nav(absoluteRoutes.home.account.path)}
                >
                    {t('done')}
                </Button>
            </div>
        );
    }

    return (
        <div className="view-seed-phrase-page">
            <div className="view-seed-phrase-page__description">{t('description')}</div>
            <Form className="view-seed-phrase-page__form" onSubmit={handleSubmit}>
                {(f) => {
                    return (
                        <>
                            <FormPassword
                                control={f.control}
                                name="currentPasscode"
                                label={tPasscode('labels.currentPasscode')}
                                className="m-t-10"
                                rules={{
                                    required: tSetup('setupPasscode.form.passcodeRequired'),
                                    validate: validateCurrentPasscode(),
                                }}
                            />
                            <Submit
                                className="view-seed-phrase-page__button"
                                width="dynamic"
                                disabled={f.formState.isSubmitting}
                            >
                                {t('show')}
                            </Submit>
                        </>
                    );
                }}
            </Form>
        </div>
    );
}

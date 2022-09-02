import Button from '@popup/shared/Button';
import CopyButton from '@popup/shared/CopyButton';
import Form from '@popup/shared/Form';
import FormPassword from '@popup/shared/Form/Password';
import Submit from '@popup/shared/Form/Submit';
import { TextArea } from '@popup/shared/Form/TextArea';
import { usePrivateKey } from '@popup/shared/utils/account-helpers';
import { selectedAccountAtom } from '@popup/store/account';
import { sessionPasscodeAtom } from '@popup/store/settings';
import { useAtomValue } from 'jotai';
import React, { useEffect, useState } from 'react';
import { Validate } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { absoluteRoutes } from '@popup/constants/routes';

export default function ExportPrivateKey() {
    const nav = useNavigate();
    const { t: tSetup } = useTranslation('setup');
    const { t: tPasscode } = useTranslation('changePasscode');
    const { t } = useTranslation('account', { keyPrefix: 'settings.exportPrivateKey' });
    const passcode = useAtomValue(sessionPasscodeAtom);
    const [showPrivateKey, setShowPrivateKey] = useState<boolean>(false);

    const selectedAccountAddress = useAtomValue(selectedAccountAtom);
    if (!selectedAccountAddress) {
        return null;
    }

    const privateKey = usePrivateKey(selectedAccountAddress);
    if (!privateKey) {
        return null;
    }

    useEffect(() => {
        setShowPrivateKey(false);
    }, [selectedAccountAddress]);

    const handleSubmit = () => {
        setShowPrivateKey(true);
    };

    function validateCurrentPasscode(): Validate<string> {
        return (currentPasscode) => (currentPasscode !== passcode.value ? tPasscode('incorrectPasscode') : undefined);
    }

    if (showPrivateKey) {
        return (
            <div className="export-private-key-page">
                <div className="export-private-key-page__description">{t('copyDescription')}</div>
                <div className="relative">
                    <TextArea value={privateKey} />
                    <CopyButton className="export-private-key-page__copy" value={privateKey} />
                </div>
                <Button
                    className="export-private-key-page__button"
                    width="narrow"
                    onClick={() => nav(absoluteRoutes.home.account.path)}
                >
                    {t('done')}
                </Button>
            </div>
        );
    }

    return (
        <div className="export-private-key-page">
            <div className="export-private-key-page__description">{t('description')}</div>
            <Form onSubmit={handleSubmit}>
                {(f) => {
                    return (
                        <>
                            <FormPassword
                                control={f.control}
                                name="currentPasscode"
                                label={tPasscode('labels.currentPasscode')}
                                className="m-t-30"
                                rules={{
                                    required: tSetup('setupPasscode.form.passcodeRequired'),
                                    validate: validateCurrentPasscode(),
                                }}
                            />
                            <Submit
                                className="export-private-key-page__button"
                                width="narrow"
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

import React, { useCallback, useEffect, useRef, useState } from 'react';
import FormPassword from '@popup/popupX/shared/Form/Password';
import Form from '@popup/popupX/shared/Form/Form';
import { useNavigate } from 'react-router-dom';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import { useTranslation } from 'react-i18next';
import Button from '@popup/popupX/shared/Button';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import { useAtom, useSetAtom } from 'jotai';
import { passcodeAtom } from '@popup/state';
import { useForm } from '@popup/shared/Form';
import { SubmitHandler, Validate } from 'react-hook-form';
import { encryptedSeedPhraseAtom, sessionPasscodeAtom } from '@popup/store/settings';

type FormValues = {
    passcode: string;
    passcodeAgain: string;
};

type LedgerDeviceDetails = {
    productName?: string;
    deviceId: string;
    opened?: boolean;
};

export default function SetupPassword() {
    const { t } = useTranslation('x', { keyPrefix: 'onboarding.setupPassword' });
    const nav = useNavigate();
    const navToNext = () => nav(absoluteRoutes.onboarding.setupPassword.createOrRestore.path);
    const setPasscode = useSetAtom(passcodeAtom);
    const setPasscodeInSession = useSetAtom(sessionPasscodeAtom);
    const [, setEncryptedSeedPhrase] = useAtom(encryptedSeedPhraseAtom);
    const form = useForm<FormValues>();
    const passcode = form.watch('passcode');

    const [ledgerDetails, setLedgerDetails] = useState<LedgerDeviceDetails | null>(null);
    const [status, setStatus] = useState<string>('');
    const listenerAttached = useRef(false);

    const handleSubmit: SubmitHandler<FormValues> = (vs) => {
        setPasscode(vs.passcode);
        setPasscodeInSession(vs.passcode);
        setEncryptedSeedPhrase(undefined);
        navToNext();
    };

    const handleLedgerMessage = (event: MessageEvent) => {
        const { type, success, details, error } = event.data;

        if (type === 'LEDGER_CONNECTED' && success) {
            setLedgerDetails(details);
            setStatus(`Connected to: ${details.productName || 'Ledger Device'}`);
        } else if (type === 'LEDGER_ERROR') {
            setLedgerDetails(null);
            setStatus(`Error: ${error}`);
        }
    };

    const connectLedgerDevice = () => {
        window.postMessage({ type: 'REQUEST_LEDGER_DEVICE' }, '*');
        if (!listenerAttached.current) {
            window.addEventListener('message', handleLedgerMessage);
            listenerAttached.current = true;
        }
    };

    const disconnectLedgerDevice = () => {
        window.postMessage({ type: 'DISCONNECT_LEDGER_DEVICE' }, '*');
        setStatus('Ledger device disconnected');
        setLedgerDetails(null);
    };

    const getLedgerStatus = () => {
        window.postMessage({ type: 'GET_LEDGER_STATUS' }, '*');
        if (!listenerAttached.current) {
            window.addEventListener('message', handleLedgerMessage);
            listenerAttached.current = true;
        }
    };

    const passcodesAreEqual: Validate<string> = useCallback(
        (value) => value === passcode || t('passcodeMismatch'),
        [passcode]
    );

    useEffect(() => {
        if (form.formState.dirtyFields.passcodeAgain) {
            form.trigger('passcodeAgain');
        }
    }, [passcode]);

    return (
        <Page className="setup-password">
            <Page.Main>
                <div className="setup-password__title">
                    <span className="concordium-logo-white" />
                    <Text.Heading>{t('setPassword')}</Text.Heading>
                    <Text.MainRegular>{t('firstStep')}</Text.MainRegular>
                </div>
                <Form
                    id="setup-password-form"
                    onSubmit={handleSubmit}
                    formMethods={form}
                    className="setup-password__form"
                >
                    {(f) => {
                        return (
                            <>
                                <FormPassword
                                    autoFocus
                                    control={f.control}
                                    showStrength
                                    name="passcode"
                                    label={t('enterPasscode')}
                                    rules={{
                                        required: t('passcodeRequired'),
                                        minLength: { value: 6, message: t('passcodeMinLength') },
                                    }}
                                />
                                <FormPassword
                                    control={f.control}
                                    name="passcodeAgain"
                                    label={t('enterPasscodeAgain')}
                                    rules={{ validate: passcodesAreEqual }}
                                />
                            </>
                        );
                    }}
                </Form>
                {status && <p style={{ marginTop: '1rem' }}>{status}</p>}
                {ledgerDetails && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                        <strong>Device Details:</strong>
                        <ul>
                            <li><strong>Product:</strong> {ledgerDetails.productName}</li>
                            <li><strong>Device ID:</strong> {ledgerDetails.deviceId}</li>
                            <li><strong>Opened:</strong> {ledgerDetails.opened ? 'Yes' : 'No'}</li>
                        </ul>
                    </div>
                )}
            </Page.Main>
            <Page.Footer>
                <Button.Main form="setup-password-form" type="submit" label={t('continue')} onClick={() => {}} />
                
                {!ledgerDetails && (
                    <Button.Main type="button" label="Connect Ledger" onClick={connectLedgerDevice} />
                )}

                {ledgerDetails && (
                    <Button.Main type="button" label="Disconnect Ledger" onClick={disconnectLedgerDevice} />
                )}
                <Button.Main type="button" label="Ledger Status" onClick={getLedgerStatus} />
            </Page.Footer>
        </Page>
    );
}

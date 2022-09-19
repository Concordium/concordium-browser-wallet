import Button from '@popup/shared/Button';
import CopyButton from '@popup/shared/CopyButton';
import Form from '@popup/shared/Form';
import FormPassword from '@popup/shared/Form/Password';
import Submit from '@popup/shared/Form/Submit';
import { TextArea } from '@popup/shared/Form/TextArea';
import { useCredential, usePrivateKey, usePublicKey } from '@popup/shared/utils/account-helpers';
import { selectedAccountAtom } from '@popup/store/account';
import { networkConfigurationAtom, sessionPasscodeAtom } from '@popup/store/settings';
import { useAtomValue } from 'jotai';
import React, { useEffect, useState } from 'react';
import { Validate } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { absoluteRoutes } from '@popup/constants/routes';
import { NetworkConfiguration } from '@shared/storage/types';
import { getNet } from '@shared/utils/network-helpers';

type CredentialKeys = {
    threshold: number;
    keys: Record<number, { signKey: string; verifyKey: string }>;
};

type AccountKeys = {
    threshold: number;
    keys: Record<number, CredentialKeys>;
};

type AccountExport = {
    accountKeys: AccountKeys;
    address: string;
    credentials: Record<string, string>;
};

type ExportFormat = {
    type: 'concordium-browser-wallet-account';
    v: number;
    environment: string; // 'testnet' or 'mainnet'
    value: AccountExport;
};

function createDownload(
    address: string,
    credId: string,
    signKey: string,
    verifyKey: string,
    network: NetworkConfiguration
) {
    const docContent: ExportFormat = {
        type: 'concordium-browser-wallet-account',
        v: 0,
        environment: getNet(network).toLowerCase(),
        value: {
            accountKeys: {
                keys: {
                    '0': {
                        keys: {
                            '0': {
                                signKey,
                                verifyKey,
                            },
                        },
                        threshold: 1,
                    },
                },
                threshold: 1,
            },
            credentials: {
                '0': credId,
            },
            address,
        },
    };
    return URL.createObjectURL(new Blob([JSON.stringify(docContent)], { type: 'application/octet-binary' }));
}

export default function ExportPrivateKey() {
    const nav = useNavigate();
    const { t: tSetup } = useTranslation('setup');
    const { t: tPasscode } = useTranslation('changePasscode');
    const { t } = useTranslation('account', { keyPrefix: 'settings.exportPrivateKey' });
    const passcode = useAtomValue(sessionPasscodeAtom);
    const [showPrivateKey, setShowPrivateKey] = useState<boolean>(false);
    const selectedAccountAddress = useAtomValue(selectedAccountAtom);
    const credential = useCredential(selectedAccountAddress);
    const privateKey = usePrivateKey(selectedAccountAddress);
    const publicKey = usePublicKey(selectedAccountAddress);
    const network = useAtomValue(networkConfigurationAtom);

    useEffect(() => {
        setShowPrivateKey(false);
    }, [selectedAccountAddress]);

    if (!selectedAccountAddress || !credential || !privateKey || !publicKey || !network) {
        return null;
    }

    const handleSubmit = () => {
        setShowPrivateKey(true);
    };

    const handleExport = () => {
        chrome.downloads.download({
            url: createDownload(selectedAccountAddress, credential.credId, privateKey, publicKey, network),
            filename: `${selectedAccountAddress}.export`,
            conflictAction: 'overwrite',
            saveAs: true,
        });
    };

    function validateCurrentPasscode(): Validate<string> {
        return (currentPasscode) => (currentPasscode !== passcode.value ? tPasscode('incorrectPasscode') : undefined);
    }

    if (showPrivateKey) {
        return (
            <div className="export-private-key-page">
                <div className="export-private-key-page__description">{t('copyDescription')}</div>
                <div className="relative">
                    <TextArea value={privateKey} readOnly />
                    <CopyButton className="export-private-key-page__copy" value={privateKey} />
                </div>
                <Button className="export-private-key-page__export-button" width="medium" onClick={handleExport}>
                    {t('export')}
                </Button>
                <Button
                    className="export-private-key-page__button"
                    width="medium"
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
            <Form className="export-private-key-page__form" onSubmit={handleSubmit}>
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
                                className="export-private-key-page__button"
                                width="medium"
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

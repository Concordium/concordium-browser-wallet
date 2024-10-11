import React from 'react';
import Page from '@popup/popupX/shared/Page';
import { useTranslation } from 'react-i18next';
import Text from '@popup/popupX/shared/Text';
import Card from '@popup/popupX/shared/Card';
import Button from '@popup/popupX/shared/Button';
import Copy from '@assets/svgX/copy.svg';
import { useAtomValue } from 'jotai';
import { selectedAccountAtom } from '@popup/store/account';
import { useCredential, usePrivateKey, usePublicKey } from '@popup/shared/utils/account-helpers';
import { networkConfigurationAtom } from '@popup/store/settings';
import { saveData } from '@popup/shared/utils/file-helpers';
import { NetworkConfiguration } from '@shared/storage/types';
import { getNet } from '@shared/utils/network-helpers';
import { copyToClipboard } from '@popup/popupX/shared/utils/helpers';

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

function createExport(
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

    return docContent;
}

function usePrivateKeyData() {
    const selectedAccountAddress = useAtomValue(selectedAccountAtom);
    const credential = useCredential(selectedAccountAddress);
    const privateKey = usePrivateKey(selectedAccountAddress);
    const publicKey = usePublicKey(selectedAccountAddress);
    const network = useAtomValue(networkConfigurationAtom);

    const isDataExist = selectedAccountAddress && credential && privateKey && publicKey && network;

    const handleExport = () => {
        if (isDataExist) {
            const data = createExport(selectedAccountAddress, credential.credId, privateKey, publicKey, network);
            saveData(data, `${selectedAccountAddress}.export`);
        }
    };

    return { privateKey: privateKey || '', handleExport };
}

export default function PrivateKey() {
    const { t } = useTranslation('x', { keyPrefix: 'privateKey' });
    const { privateKey, handleExport } = usePrivateKeyData();

    return (
        <Page className="account-private-key-x">
            <Page.Top heading={t('accountPrivateKey')} />
            <Page.Main>
                <Text.Capture>{t('keyDescription')}</Text.Capture>
                <Card>
                    <Text.LabelRegular>{privateKey}</Text.LabelRegular>
                </Card>
                <Button.IconText label={t('copyKey')} icon={<Copy />} onClick={() => copyToClipboard(privateKey)} />
            </Page.Main>
            <Page.Footer>
                <Button.Main label={t('export')} onClick={handleExport} />
            </Page.Footer>
        </Page>
    );
}

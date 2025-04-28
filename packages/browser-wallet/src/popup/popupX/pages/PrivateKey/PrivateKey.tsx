import React from 'react';
import Page from '@popup/popupX/shared/Page';
import { useTranslation } from 'react-i18next';
import i18n from '@popup/shell/i18n/i18n';
import Text from '@popup/popupX/shared/Text';
import Card from '@popup/popupX/shared/Card';
import Button from '@popup/popupX/shared/Button';
import Copy from '@assets/svgX/copy.svg';
import { useAtomValue } from 'jotai';
import { useCredential, usePrivateKey, usePublicKey } from '@popup/shared/utils/account-helpers';
import { networkConfigurationAtom } from '@popup/store/settings';
import { saveData } from '@popup/shared/utils/file-helpers';
import { NetworkConfiguration } from '@shared/storage/types';
import { getNet } from '@shared/utils/network-helpers';
import { Navigate, useParams } from 'react-router-dom';
import { withPasswordProtected } from '@popup/popupX/shared/utils/hoc';
import { useCopyToClipboard } from '@popup/popupX/shared/utils/hooks';

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

function usePrivateKeyData(selectedAccountAddress: string) {
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

type Props = {
    address: string;
};

function PrivateKey({ address }: Props) {
    const { t } = useTranslation('x', { keyPrefix: 'privateKey' });
    const { privateKey, handleExport } = usePrivateKeyData(address);
    const copyToClipboard = useCopyToClipboard();

    return (
        <Page className="account-private-key-x">
            <Page.Top heading={t('accountPrivateKey')} />
            <Page.Main>
                <Text.Capture>{t('keyDescription')}</Text.Capture>
                <Card>
                    <Text.LabelRegular>
                        {privateKey ?? (
                            /* When no private key, put in two lines to avoid UI jumping around as it loads. */ <>
                                <br />
                                <br />
                            </>
                        )}
                    </Text.LabelRegular>
                </Card>
                <Button.IconText label={t('copyKey')} icon={<Copy />} onClick={() => copyToClipboard(privateKey)} />
            </Page.Main>
            <Page.Footer>
                <Button.Main label={t('export')} onClick={handleExport} />
            </Page.Footer>
        </Page>
    );
}

function Loader() {
    const params = useParams();
    if (!('account' in params) || params.account === undefined) {
        // No account address passed in the url.
        return <Navigate to="../" />;
    }
    return <PrivateKey address={params.account} />;
}

export default withPasswordProtected(Loader, {
    headingText: i18n.t('x:privateKey.accountPrivateKey'),
    pageInfoText: i18n.t('x:privateKey.passwordDescription'),
    submitText: i18n.t('x:privateKey.showPrivateKey'),
});

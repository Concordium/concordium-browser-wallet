import React from 'react';
import Plus from '@assets/svgX/plus.svg';
import { useTranslation } from 'react-i18next';
import Page from '@popup/popupX/shared/Page';
import Button from '@popup/popupX/shared/Button';
import Web3IdCard from '@popup/popupX/shared/Web3IdCard';
import { useNavigate } from 'react-router-dom';
import { relativeRoutes } from '@popup/popupX/constants/routes';
import { useAtomValue } from 'jotai';
import { storedVerifiableCredentialsAtom } from '@popup/store/verifiable-credential';

export default function Web3IdCredentials() {
    const { t } = useTranslation('x', { keyPrefix: 'web3Id.credentials' });
    const verifiableCredentials = useAtomValue(storedVerifiableCredentialsAtom);
    const nav = useNavigate();
    const navToImport = () => nav(relativeRoutes.settings.web3Id.import.path);

    return (
        <Page className="web3-id-x credentials">
            <Page.Top heading={t('webId')}>
                <Button.Icon icon={<Plus />} onClick={navToImport} />
            </Page.Top>
            <Page.Main>
                {verifiableCredentials.value.map((vc) => (
                    <Web3IdCard credential={vc} />
                ))}
            </Page.Main>
        </Page>
    );
}

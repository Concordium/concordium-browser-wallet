import React from 'react';
import Plus from '@assets/svgX/plus.svg';
import { useTranslation } from 'react-i18next';
import Page from '@popup/popupX/shared/Page';
import Button from '@popup/popupX/shared/Button';
import Web3IdCard from '@popup/popupX/shared/Web3IdCard';
import { useNavigate } from 'react-router-dom';
import { relativeRoutes, web3IdDetailsRoute } from '@popup/popupX/constants/routes';
import { useAtomValue } from 'jotai';
import { storedVerifiableCredentialsAtom } from '@popup/store/verifiable-credential';
import { VerifiableCredential } from '@shared/storage/types';
import { ContractAddress } from '@concordium/web-sdk';

export default function Web3IdCredentials() {
    const { t } = useTranslation('x', { keyPrefix: 'web3Id.credentials' });
    const verifiableCredentials = useAtomValue(storedVerifiableCredentialsAtom);
    const nav = useNavigate();

    const toDetails = (vc: VerifiableCredential) => {
        const [, index, subindex, id] =
            vc.id.match(/.*:sci:(\d*):(\d*)\/credentialEntry\/(.*)$/) ??
            (() => {
                throw new Error('Invalid ID found in verifiable credential');
            })();
        const contract = ContractAddress.create(BigInt(index), BigInt(subindex));
        nav(web3IdDetailsRoute(contract, id));
    };

    return (
        <Page className="web3-id-x credentials">
            <Page.Top heading={t('title')}>
                <Button.Icon icon={<Plus />} onClick={() => nav(relativeRoutes.settings.web3Id.import.path)} />
            </Page.Top>
            <Page.Main>
                {verifiableCredentials.value.map((vc) => (
                    <Button.Base className="web3-id-x__card" onClick={() => toDetails(vc)}>
                        <Web3IdCard key={vc.id} credential={vc} />
                    </Button.Base>
                ))}
            </Page.Main>
        </Page>
    );
}

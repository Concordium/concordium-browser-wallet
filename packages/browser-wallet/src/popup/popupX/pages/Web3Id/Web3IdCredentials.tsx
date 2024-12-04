import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';

import Plus from '@assets/svgX/plus.svg';
import Page from '@popup/popupX/shared/Page';
import Button from '@popup/popupX/shared/Button';
import Web3IdCard from '@popup/popupX/shared/Web3IdCard';
import { relativeRoutes, web3IdDetailsRoute } from '@popup/popupX/constants/routes';
import { storedVerifiableCredentialsAtom } from '@popup/store/verifiable-credential';
import { VerifiableCredential } from '@shared/storage/types';
import { parseCredentialDID } from '@shared/utils/verifiable-credential-helpers';

export default function Web3IdCredentials() {
    const { t } = useTranslation('x', { keyPrefix: 'web3Id.credentials' });
    const verifiableCredentials = useAtomValue(storedVerifiableCredentialsAtom);
    const nav = useNavigate();

    const toDetails = (vc: VerifiableCredential) => {
        const [contract, id] = parseCredentialDID(vc.id);
        nav(web3IdDetailsRoute(contract, id));
    };

    return (
        <Page className="web3-id-x credentials">
            <Page.Top heading={t('title')}>
                <Button.Icon icon={<Plus />} onClick={() => nav(relativeRoutes.settings.web3Id.import.path)} />
            </Page.Top>
            <Page.Main>
                {verifiableCredentials.value.map((vc) => (
                    <Button.Base key={vc.id} className="web3-id-x__card" onClick={() => toDetails(vc)}>
                        <Web3IdCard credential={vc} />
                    </Button.Base>
                ))}
            </Page.Main>
        </Page>
    );
}

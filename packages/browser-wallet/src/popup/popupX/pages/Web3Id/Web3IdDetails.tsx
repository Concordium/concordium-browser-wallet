import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { ContractAddress, HexString } from '@concordium/web-sdk';

import Page from '@popup/popupX/shared/Page';
import Web3IdCard from '@popup/popupX/shared/Web3IdCard';
import { storedVerifiableCredentialsAtom } from '@popup/store/verifiable-credential';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import { networkConfigurationAtom } from '@popup/store/settings';
import { createCredentialId } from '@shared/utils/verifiable-credential-helpers';
import Button from '@popup/popupX/shared/Button';
import Stop from '@assets/svgX/stop.svg';
import Info from '@assets/svgX/info.svg';

type Props = {
    contract: ContractAddress.Type;
    id: HexString;
};

function Web3IdDetailsParsed({ id, contract }: Props) {
    const { t } = useTranslation('x', { keyPrefix: 'web3Id.details' });
    const verifiableCredentials = useAtomValue(storedVerifiableCredentialsAtom);
    const net = useAtomValue(networkConfigurationAtom);
    const credential = verifiableCredentials.value.find((c) => c.id === createCredentialId(id, contract, net));
    const [showInfo, setShowInfo] = useState(false);

    if (verifiableCredentials.loading) return null;
    if (credential === undefined) throw new Error('Expected to find credential');

    return (
        <Page>
            <Page.Top heading={t('title')}>
                <Button.Icon icon={<Stop />} />
                <Button.Icon
                    className="web3-id-details-x__info"
                    icon={<Info />}
                    onClick={() => setShowInfo((v) => !v)}
                />
            </Page.Top>
            <Page.Main>
                <Web3IdCard showInfo={showInfo} credential={credential} />
            </Page.Main>
        </Page>
    );
}

export default function Web3IdDetails() {
    const params = useParams();

    if (params.sci === undefined || params.holderId === undefined) {
        return <Navigate to={absoluteRoutes.settings.web3Id.path} replace />;
    }

    const [index, subindex] = params.sci.split('-');
    const contract = ContractAddress.create(BigInt(index), BigInt(subindex));

    return <Web3IdDetailsParsed contract={contract} id={params.holderId} />;
}

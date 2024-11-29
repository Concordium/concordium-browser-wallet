import React from 'react';
import Page from '@popup/popupX/shared/Page';
import { useTranslation } from 'react-i18next';
import Web3IdCard from '@popup/popupX/shared/Web3IdCard';
import { useAtomValue } from 'jotai';
import { storedVerifiableCredentialsAtom } from '@popup/store/verifiable-credential';
import { ContractAddress, HexString } from '@concordium/web-sdk';
import { Navigate, useParams } from 'react-router-dom';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import { networkConfigurationAtom } from '@popup/store/settings';
import { createCredentialId } from '@shared/utils/verifiable-credential-helpers';

type Props = {
    contract: ContractAddress.Type;
    id: HexString;
};

function Web3IdDetailsParsed({ id, contract }: Props) {
    const { t } = useTranslation('x', { keyPrefix: 'web3Id.details' });
    const verifiableCredentials = useAtomValue(storedVerifiableCredentialsAtom);
    const net = useAtomValue(networkConfigurationAtom);
    const credential = verifiableCredentials.value.find((c) => c.id === createCredentialId(id, contract, net));

    if (verifiableCredentials.loading) return null;
    if (credential === undefined) throw new Error('Expected to find credential');

    return (
        <Page>
            <Page.Top heading={t('title')} />
            <Page.Main>
                <Web3IdCard credential={credential} />
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

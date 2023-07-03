import React from 'react';
import { Buffer } from 'buffer/';
import { storedVerifiableCredentialSchemasAtom } from '@popup/store/verifiable-credential';
import { useAtomValue } from 'jotai';
import { VerifiableCredential } from '@shared/storage/types';
import Topbar, { ButtonTypes, MenuButton } from '@popup/shared/Topbar/Topbar';
import { useTranslation } from 'react-i18next';
import { AccountTransactionType, CcdAmount, ConcordiumGRPCClient, UpdateContractPayload } from '@concordium/web-sdk';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    RevocationDataHolder,
    RevokeCredentialHolderParam,
    SigningData,
    getCredentialHolderId,
    getCredentialRegistryContractAddress,
    serializeRevokeCredentialHolderParam,
    sign,
} from '@shared/utils/verifiable-credential-helpers';
import { fetchContractName } from '@shared/utils/token-helpers';
import { grpcClientAtom } from '@popup/store/settings';
import { absoluteRoutes } from '@popup/constants/routes';
import { selectedAccountAtom } from '@popup/store/account';
import { usePrivateKey } from '@popup/shared/utils/account-helpers';
import { accountRoutes } from '../Account/routes';
import { ConfirmGenericTransferState } from '../Account/ConfirmGenericTransfer';
import RevokeIcon from '../../../assets/svg/revoke.svg';
import { useCredentialStatus } from './VerifiableCredentialHooks';
import { VerifiableCredentialCard } from './VerifiableCredentialCard';

const REVOKE_SIGNATURE_MESSAGE = 'WEB3ID:REVOKE';

async function buildRevokeTransaction(
    client: ConcordiumGRPCClient,
    credential: VerifiableCredential,
    privateKey: string
): Promise<UpdateContractPayload> {
    const address = getCredentialRegistryContractAddress(credential.id);
    const contractName = await fetchContractName(client, address.index, address.subindex);

    // TODO Get the correct nonce.

    const signingData: SigningData = {
        contractAddress: address,
        entryPoint: 'revokeCredentialHolder',
        nonce: BigInt(1),
        timestamp: BigInt(Date.now() + 60000),
    };

    const data: RevocationDataHolder = {
        credentialId: getCredentialHolderId(credential.id),
        signingData,
    };

    const signature = await sign(Buffer.from(REVOKE_SIGNATURE_MESSAGE, 'utf-8'), privateKey);
    const parameter: RevokeCredentialHolderParam = {
        signature,
        data,
    };

    // Get better NRG estimate. How to do that?
    return {
        address,
        amount: new CcdAmount(0n),
        receiveName: `${contractName}.revokeCredentialHolder`,
        maxContractExecutionEnergy: BigInt(5000),
        message: serializeRevokeCredentialHolderParam(parameter),
    };
}

export default function VerifiableCredentialDetails({
    credential,
    backButtonOnClick,
}: {
    credential: VerifiableCredential;
    backButtonOnClick: () => void;
}) {
    const nav = useNavigate();
    const schemas = useAtomValue(storedVerifiableCredentialSchemasAtom);
    const { t } = useTranslation('verifiableCredential');

    const client = useAtomValue(grpcClientAtom);
    const { pathname } = useLocation();

    const selectedAccount = useAtomValue(selectedAccountAtom);
    const key = usePrivateKey(selectedAccount);

    const goToConfirm = () => {
        // TODO Fix this... Basically we need to wait for these values before displaying the card.
        if (!selectedAccount || !key) {
            return;
        }

        buildRevokeTransaction(client, credential, key).then((payload) => {
            const confirmTransferState: ConfirmGenericTransferState = {
                payload,
                type: AccountTransactionType.Update,
            };

            // Override current router entry with stateful version
            nav(pathname, { replace: true, state: true });
            nav(`${absoluteRoutes.home.account.path}/${accountRoutes.confirmTransfer}`, {
                state: confirmTransferState,
            });
        });
    };

    const menuButton: MenuButton = {
        type: ButtonTypes.More,
        items: [{ title: t('menu.revoke'), icon: <RevokeIcon />, onClick: () => goToConfirm() }],
    };

    return (
        <>
            <Topbar
                title={t('topbar.details')}
                backButton={{ show: true, onClick: backButtonOnClick }}
                menuButton={menuButton}
            />
            <div className="verifiable-credential-list">
                <VerifiableCredentialCard
                    credential={credential}
                    schema={schemas.value[credential.credentialSchema.id]}
                    useCredentialStatus={(cred) => useCredentialStatus(cred)}
                />
            </div>
        </>
    );
}

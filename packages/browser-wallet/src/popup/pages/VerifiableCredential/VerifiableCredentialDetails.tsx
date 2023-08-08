import React, { useCallback, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { VerifiableCredential, VerifiableCredentialSchema, VerifiableCredentialStatus } from '@shared/storage/types';
import Topbar, { ButtonTypes, MenuButton } from '@popup/shared/Topbar/Topbar';
import { useTranslation } from 'react-i18next';
import { AccountTransactionType } from '@concordium/web-sdk';
import { useLocation, useNavigate } from 'react-router-dom';
import { grpcClientAtom } from '@popup/store/settings';
import { absoluteRoutes } from '@popup/constants/routes';
import { useHdWallet } from '@popup/shared/utils/account-helpers';
import {
    VerifiableCredentialMetadata,
    buildRevokeTransaction,
    buildRevokeTransactionParameters,
    getCredentialHolderId,
    getCredentialRegistryContractAddress,
    getRevokeTransactionExecutionEnergyEstimate,
} from '@shared/utils/verifiable-credential-helpers';
import { fetchContractName } from '@shared/utils/token-helpers';
import { accountRoutes } from '../Account/routes';
import { ConfirmGenericTransferState } from '../Account/ConfirmGenericTransfer';
import RevokeIcon from '../../../assets/svg/revoke.svg';
import { useCredentialEntry } from './VerifiableCredentialHooks';
import { VerifiableCredentialCard } from './VerifiableCredentialCard';

export default function VerifiableCredentialDetails({
    credential,
    status,
    metadata,
    schema,
    backButtonOnClick,
}: {
    credential: VerifiableCredential;
    status: VerifiableCredentialStatus;
    metadata: VerifiableCredentialMetadata;
    schema: VerifiableCredentialSchema;
    backButtonOnClick: () => void;
}) {
    const nav = useNavigate();
    const { pathname } = useLocation();
    const { t } = useTranslation('verifiableCredential');
    const client = useAtomValue(grpcClientAtom);
    const hdWallet = useHdWallet();
    const credentialEntry = useCredentialEntry(credential);

    const goToConfirmPage = useCallback(async () => {
        if (credentialEntry === undefined || hdWallet === undefined) {
            return;
        }

        const contractAddress = getCredentialRegistryContractAddress(credential.id);
        const credentialId = getCredentialHolderId(credential.id);
        const contractName = await fetchContractName(client, contractAddress.index, contractAddress.subindex);
        if (contractName === undefined) {
            throw new Error(`Unable to find contract name for address: ${contractAddress}`);
        }

        // TODO Select the correct key.
        const signingKey = '741C117235A8F23AC9EB196B6A53FCD2C808691398407F7357548B7D437FC734';

        const parameters = await buildRevokeTransactionParameters(
            contractAddress,
            credentialId,
            credentialEntry.revocationNonce,
            signingKey
        );
        const maxExecutionEnergy = await getRevokeTransactionExecutionEnergyEstimate(client, contractName, parameters);
        const payload = await buildRevokeTransaction(
            contractAddress,
            contractName,
            credentialId,
            maxExecutionEnergy,
            parameters
        );

        const confirmTransferState: ConfirmGenericTransferState = {
            payload,
            type: AccountTransactionType.Update,
        };

        // Override current router entry with stateful version
        nav(pathname, { replace: true, state: true });
        nav(`${absoluteRoutes.home.account.path}/${accountRoutes.confirmTransfer}`, {
            state: confirmTransferState,
        });
    }, [client, credential, hdWallet, credentialEntry, nav, pathname]);

    const menuButton: MenuButton | undefined = useMemo(() => {
        if (credentialEntry === undefined || !credentialEntry.credentialInfo.holderRevocable) {
            return undefined;
        }

        return {
            type: ButtonTypes.More,
            items: [
                {
                    title: t('menu.revoke'),
                    icon: <RevokeIcon />,
                    onClick: goToConfirmPage,
                },
            ],
        };
    }, [credentialEntry, goToConfirmPage]);

    // Wait for the credential entry to be loaded from the chain, and for the HdWallet
    // to be loaded to be ready to derive keys.
    if (credentialEntry === undefined || hdWallet === undefined) {
        return null;
    }

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
                    schema={schema}
                    credentialStatus={status}
                    metadata={metadata}
                />
            </div>
        </>
    );
}

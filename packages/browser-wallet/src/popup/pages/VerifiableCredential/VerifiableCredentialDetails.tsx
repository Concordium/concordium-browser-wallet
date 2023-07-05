import React, { useCallback, useMemo } from 'react';
import { storedVerifiableCredentialSchemasAtom } from '@popup/store/verifiable-credential';
import { useAtomValue } from 'jotai';
import { VerifiableCredential } from '@shared/storage/types';
import Topbar, { ButtonTypes, MenuButton } from '@popup/shared/Topbar/Topbar';
import { useTranslation } from 'react-i18next';
import { AccountTransactionType } from '@concordium/web-sdk';
import { useLocation, useNavigate } from 'react-router-dom';
import { grpcClientAtom } from '@popup/store/settings';
import { absoluteRoutes } from '@popup/constants/routes';
import { useHdWallet } from '@popup/shared/utils/account-helpers';
import {
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
import { useCredentialEntry, useCredentialStatus } from './VerifiableCredentialHooks';
import { VerifiableCredentialCard } from './VerifiableCredentialCard';

/**
 * Calculates the next revocation nonce based on the current revocation nonce.
 * @param nonce the current nonce returned in the credential entry
 * @returns the next nonce to use for a holder revocation update
 */
function getNextRevocationNonce(nonce: bigint) {
    return nonce + 1n;
}

export default function VerifiableCredentialDetails({
    credential,
    backButtonOnClick,
}: {
    credential: VerifiableCredential;
    backButtonOnClick: () => void;
}) {
    const nav = useNavigate();
    const { pathname } = useLocation();
    const { t } = useTranslation('verifiableCredential');
    const schemas = useAtomValue(storedVerifiableCredentialSchemasAtom);
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
        const revocationNonce = getNextRevocationNonce(credentialEntry.revocationNonce);
        const signingKey = hdWallet.getVerifiableCredentialSigningKey(0).toString('hex');

        const parameters = await buildRevokeTransactionParameters(
            contractAddress,
            credentialId,
            revocationNonce,
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
        if (credentialEntry === undefined) {
            return undefined;
        }

        return {
            type: ButtonTypes.More,
            items: [
                {
                    title: t('menu.revoke'),
                    icon: <RevokeIcon />,
                    onClick: credentialEntry.holderRevocable ? () => goToConfirmPage() : undefined,
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
                    schema={schemas.value[credential.credentialSchema.id]}
                    useCredentialStatus={(cred) => useCredentialStatus(cred)}
                />
            </div>
        </>
    );
}

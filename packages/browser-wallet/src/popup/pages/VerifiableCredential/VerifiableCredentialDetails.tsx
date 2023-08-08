import React, { useCallback, useMemo, useState } from 'react';
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
    CredentialQueryResponse,
    VerifiableCredentialMetadata,
    buildRevokeTransaction,
    buildRevokeTransactionParameters,
    getCredentialHolderId,
    getCredentialRegistryContractAddress,
    getRevokeTransactionExecutionEnergyEstimate,
} from '@shared/utils/verifiable-credential-helpers';
import { fetchContractName } from '@shared/utils/token-helpers';
import { TimeStampUnit, dateFromTimestamp } from 'wallet-common-helpers';
import { withDateAndTime } from '@shared/utils/time-helpers';
import { accountRoutes } from '../Account/routes';
import { ConfirmGenericTransferState } from '../Account/ConfirmGenericTransfer';
import RevokeIcon from '../../../assets/svg/revoke.svg';
import { useCredentialEntry } from './VerifiableCredentialHooks';
import { DisplayAttribute, VerifiableCredentialCard, VerifiableCredentialCardHeader } from './VerifiableCredentialCard';

/**
 * Component for displaying the extra details about a verifiable credential, i.e. the
 * credential holder id, when it is valid from and, if available, when it is valid until.
 */
function VerifiableCredentialExtraDetails({
    credentialEntry,
    status,
    metadata,
}: {
    credentialEntry: CredentialQueryResponse;
    status: VerifiableCredentialStatus;
    metadata: VerifiableCredentialMetadata;
}) {
    const { t } = useTranslation('verifiableCredential');

    const validFrom = dateFromTimestamp(credentialEntry.credentialInfo.validFrom, TimeStampUnit.milliSeconds);
    const validUntil = credentialEntry.credentialInfo.validUntil
        ? dateFromTimestamp(credentialEntry.credentialInfo.validUntil, TimeStampUnit.milliSeconds)
        : undefined;
    const validFromFormatted = withDateAndTime(validFrom);
    const validUntilFormatted = withDateAndTime(validUntil);

    return (
        <div className="verifiable-credential-wrapper">
            <div className="verifiable-credential" style={{ backgroundColor: metadata.background_color }}>
                <VerifiableCredentialCardHeader credentialStatus={status} metadata={metadata} />
                <div className="verifiable-credential__body-attributes">
                    <DisplayAttribute
                        attributeKey="credentialHolderId"
                        attributeTitle={t('details.id')}
                        attributeValue={credentialEntry.credentialInfo.credentialHolderId}
                    />
                    <DisplayAttribute
                        attributeKey="validFrom"
                        attributeTitle={t('details.validFrom')}
                        attributeValue={validFromFormatted}
                    />
                    {credentialEntry.credentialInfo.validUntil !== undefined && (
                        <DisplayAttribute
                            attributeKey="validUntil"
                            attributeTitle={t('details.validUntil')}
                            attributeValue={validUntilFormatted}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

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
    const [showExtraDetails, setShowExtraDetails] = useState(false);

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
                {
                    title: t('menu.details'),
                    onClick: () => setShowExtraDetails(true),
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
                backButton={{
                    show: true,
                    onClick: () => (showExtraDetails ? setShowExtraDetails(false) : backButtonOnClick()),
                }}
                menuButton={menuButton}
            />
            {showExtraDetails && (
                <VerifiableCredentialExtraDetails
                    credentialEntry={credentialEntry}
                    status={status}
                    metadata={metadata}
                />
            )}
            {!showExtraDetails && (
                <div className="verifiable-credential-wrapper">
                    <VerifiableCredentialCard
                        credential={credential}
                        schema={schema}
                        credentialStatus={status}
                        metadata={metadata}
                    />
                </div>
            )}
        </>
    );
}

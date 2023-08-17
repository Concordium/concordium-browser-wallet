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
import { TimeStampUnit, dateFromTimestamp, ClassName } from 'wallet-common-helpers';
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
    className,
}: {
    credentialEntry: CredentialQueryResponse;
    status: VerifiableCredentialStatus;
    metadata: VerifiableCredentialMetadata;
} & ClassName) {
    const { t } = useTranslation('verifiableCredential');

    const validFrom = dateFromTimestamp(credentialEntry.credentialInfo.validFrom, TimeStampUnit.milliSeconds);
    const validUntil = credentialEntry.credentialInfo.validUntil
        ? dateFromTimestamp(credentialEntry.credentialInfo.validUntil, TimeStampUnit.milliSeconds)
        : undefined;
    const validFromFormatted = withDateAndTime(validFrom);
    const validUntilFormatted = withDateAndTime(validUntil);

    return (
        <div className="verifiable-credential-wrapper">
            <div className={`verifiable-credential ${className}`} style={{ backgroundColor: metadata.backgroundColor }}>
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

interface CredentialDetailsProps extends ClassName {
    credential: VerifiableCredential;
    status: VerifiableCredentialStatus;
    metadata: VerifiableCredentialMetadata;
    schema: VerifiableCredentialSchema;
    backButtonOnClick: () => void;
}

export default function VerifiableCredentialDetails({
    credential,
    status,
    metadata,
    schema,
    backButtonOnClick,
    className,
}: CredentialDetailsProps) {
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

        const signingKey = hdWallet
            .getVerifiableCredentialSigningKey(contractAddress, credential.index)
            .toString('hex');

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

        nav(`${absoluteRoutes.home.account.path}/${accountRoutes.confirmTransfer}`, {
            state: confirmTransferState,
        });
    }, [client, credential, hdWallet, credentialEntry, nav, pathname]);

    const menuButton: MenuButton | undefined = useMemo(() => {
        if (credentialEntry === undefined) {
            return undefined;
        }

        const menuButtons = [];

        if (credentialEntry?.credentialInfo.holderRevocable && status !== VerifiableCredentialStatus.Revoked) {
            const revokeButton = {
                title: t('menu.revoke'),
                icon: <RevokeIcon />,
                onClick: goToConfirmPage,
            };
            menuButtons.push(revokeButton);
        }

        if (!showExtraDetails) {
            const detailsButton = {
                title: t('menu.details'),
                onClick: () => setShowExtraDetails(true),
            };
            menuButtons.push(detailsButton);
        }

        if (menuButtons.length > 0) {
            return {
                type: ButtonTypes.More,
                items: menuButtons,
            };
        }
        return undefined;
    }, [credentialEntry?.credentialInfo.holderRevocable, goToConfirmPage, showExtraDetails]);

    // Wait for the credential entry to be loaded from the chain, and for the HdWallet
    // to be loaded to be ready to derive keys.
    if (credentialEntry === undefined || hdWallet === undefined) {
        return null;
    }

    return (
        <>
            <Topbar
                title={t('topbar.details')}
                onBackButtonClick={() => (showExtraDetails ? setShowExtraDetails(false) : backButtonOnClick())}
                menuButton={menuButton}
            />
            {showExtraDetails && (
                <VerifiableCredentialExtraDetails
                    className={className}
                    credentialEntry={credentialEntry}
                    status={status}
                    metadata={metadata}
                />
            )}
            {!showExtraDetails && (
                <div className="verifiable-credential-wrapper">
                    <VerifiableCredentialCard
                        className={className}
                        credentialSubject={credential.credentialSubject}
                        schema={schema}
                        credentialStatus={status}
                        metadata={metadata}
                    />
                </div>
            )}
        </>
    );
}

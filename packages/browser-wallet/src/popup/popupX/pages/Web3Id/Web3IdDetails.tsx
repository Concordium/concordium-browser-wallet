import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import {
    AccountAddress,
    AccountTransactionType,
    ContractAddress,
    HexString,
    TransactionHash,
} from '@concordium/web-sdk';

import Page from '@popup/popupX/shared/Page';
import Web3IdCard from '@popup/popupX/shared/Web3IdCard';
import { storedVerifiableCredentialsAtom } from '@popup/store/verifiable-credential';
import { absoluteRoutes, submittedTransactionRoute } from '@popup/popupX/constants/routes';
import { grpcClientAtom, networkConfigurationAtom } from '@popup/store/settings';
import {
    CredentialQueryResponse,
    buildRevokeTransaction,
    buildRevokeTransactionParameters,
    createCredentialId,
    getCredentialHolderId,
    getCredentialRegistryContractAddress,
    getRevokeTransactionExecutionEnergyEstimate,
} from '@shared/utils/verifiable-credential-helpers';
import Button from '@popup/popupX/shared/Button';
import Stop from '@assets/svgX/stop.svg';
import Info from '@assets/svgX/info.svg';
import { useCredentialEntry } from '@popup/popupX/shared/utils/verifiable-credentials';
import FullscreenNotice, { FullscreenNoticeProps } from '@popup/popupX/shared/FullscreenNotice';
import { displayNameOrSplitAddress, useHdWallet, useSelectedCredential } from '@popup/shared/utils/account-helpers';
import { fetchContractName } from '@shared/utils/token-helpers';
import Text from '@popup/popupX/shared/Text';
import { ConfirmedCredential, CreationStatus, VerifiableCredential } from '@shared/storage/types';
import { displayAsCcd, noOp, useAsyncMemo } from 'wallet-common-helpers';
import {
    TransactionSubmitError,
    TransactionSubmitErrorType,
    useGetTransactionFee,
    useTransactionSubmit,
} from '@popup/shared/utils/transaction-helpers';
import ErrorMessage from '@popup/popupX/shared/Form/ErrorMessage';

type ConfirmRevocationProps = FullscreenNoticeProps & {
    credential: VerifiableCredential;
    entry: CredentialQueryResponse | undefined;
    walletCred: ConfirmedCredential;
};

function ConfirmRevocation({ credential, entry, walletCred, ...props }: ConfirmRevocationProps) {
    const { t } = useTranslation('x', { keyPrefix: 'web3Id.details.confirmRevoke' });
    const hdWallet = useHdWallet();
    const client = useAtomValue(grpcClientAtom);
    const getFee = useGetTransactionFee();
    const nav = useNavigate();
    const submitTransaction = useTransactionSubmit(
        AccountAddress.fromBase58(walletCred.address),
        AccountTransactionType.Update
    );
    const [error, setError] = useState<Error>();

    const payload = useAsyncMemo(
        async () => {
            if (entry === undefined || hdWallet === undefined || credential === undefined) {
                return undefined;
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
                entry.revocationNonce,
                signingKey
            );
            const maxExecutionEnergy = await getRevokeTransactionExecutionEnergyEstimate(
                client,
                contractName,
                parameters
            );
            return buildRevokeTransaction(contractAddress, contractName, credentialId, maxExecutionEnergy, parameters);
        },
        noOp,
        [client, credential, hdWallet, entry]
    );
    const fee = useMemo(
        () => (payload === undefined ? undefined : getFee(AccountTransactionType.Update, payload)),
        [payload, getFee]
    );

    const submit = async () => {
        if (fee === undefined || payload === undefined) {
            throw Error('Fee could not be calculated');
        }
        try {
            const tx = await submitTransaction(payload, fee);
            nav(submittedTransactionRoute(TransactionHash.fromHexString(tx)));
        } catch (e) {
            if (e instanceof Error) {
                setError(e);
            }
        }
    };

    useEffect(() => {
        setError(undefined);
    }, [props.open]);

    return (
        <FullscreenNotice {...props}>
            <Page>
                <Page.Top heading={t('title')} />
                <Text.Capture>{t('description')}</Text.Capture>
                <Text.Capture className="m-t-30">
                    {t('fee')}
                    <br />
                    {fee === undefined ? '...' : displayAsCcd(fee, false, true)}
                </Text.Capture>
                <Text.Capture className="m-t-5">
                    {t('account')}
                    <br />
                    {displayNameOrSplitAddress(walletCred)}
                </Text.Capture>
                {error instanceof TransactionSubmitError &&
                    error.type === TransactionSubmitErrorType.InsufficientFunds && (
                        <ErrorMessage className="m-t-10 text-center">{t('error.insufficientFunds')}</ErrorMessage>
                    )}
                <Page.Footer>
                    <Button.Main label={t('buttonContinue')} onClick={submit} disabled={payload === undefined} />
                    <Button.Main label={t('buttonCancel')} onClick={props.onClose} />
                </Page.Footer>
            </Page>
        </FullscreenNotice>
    );
}

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
    const [showConfirm, setShowConfirm] = useState(false);
    const credentialEntry = useCredentialEntry(credential);
    const walletCredential = useSelectedCredential();

    if (verifiableCredentials.loading) return null;
    if (credential === undefined) throw new Error('Expected to find credential');

    return (
        <>
            {walletCredential?.status === CreationStatus.Confirmed && (
                <ConfirmRevocation
                    open={showConfirm}
                    onClose={() => setShowConfirm(false)}
                    credential={credential}
                    entry={credentialEntry}
                    walletCred={walletCredential}
                />
            )}
            <Page>
                <Page.Top heading={t('title')}>
                    {walletCredential?.status === CreationStatus.Confirmed &&
                        credentialEntry?.credentialInfo.holderRevocable &&
                        credentialEntry !== undefined && (
                            <Button.Icon icon={<Stop />} onClick={() => setShowConfirm(true)} />
                        )}
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
        </>
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

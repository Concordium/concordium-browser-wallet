import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { useLocation } from 'react-router-dom';
import { useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
    CredentialStatements,
    RequestStatement,
    ConcordiumHdWallet,
    isAccountCredentialStatement,
    ConcordiumGRPCClient,
    CommitmentInput,
    isVerifiableCredentialStatement,
    CredentialStatement,
    Network,
    createAccountDID,
} from '@concordium/web-sdk';

import { grpcClientAtom, networkConfigurationAtom } from '@popup/store/settings';
import { credentialsAtom } from '@popup/store/account';
import { addToastAtom } from '@popup/state';
import { useDecryptedSeedPhrase } from '@popup/shared/utils/seed-phrase-helpers';
import { getGlobal, getNet } from '@shared/utils/network-helpers';
import PendingArrows from '@assets/svg/pending-arrows.svg';
import ExternalRequestLayout from '@popup/page-layouts/ExternalRequestLayout';
import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import Button from '@popup/shared/Button';
import { displayUrl } from '@popup/shared/utils/string-helpers';
import {
    storedVerifiableCredentialsAtom,
    storedVerifiableCredentialSchemasAtom,
} from '@popup/store/verifiable-credential';
import { useConfirmedIdentities } from '@popup/shared/utils/identity-helpers';
import { parse } from '@shared/utils/payload-helpers';
import { VerifiableCredential, VerifiableCredentialStatus, WalletCredential } from '@shared/storage/types';
import { getVerifiableCredentialStatus } from '@shared/utils/verifiable-credential-helpers';
import { noOp, useAsyncMemo } from 'wallet-common-helpers';
import CloseIcon from '@assets/svg/cross.svg';
import BackIcon from '@assets/svg/arrow_backward.svg';
import ContinueIcon from '@assets/svg/arrow_forward.svg';
import { proveWeb3Request } from '@shared/utils/proof-helpers';
import {
    createWeb3IdDIDFromCredential,
    getAccountCredentialCommitmentInput,
    getAccountCredentialsWithMatchingIssuer,
    getActiveWeb3IdCredentialsWithMatchingIssuer,
    getViableAccountCredentialsForStatement,
    getViableWeb3IdCredentialsForStatement,
    getWeb3CommitmentInput,
} from './utils';
import { DisplayCredentialStatement } from './DisplayStatement';

type Props = {
    onSubmit(presentationString: string): void;
    onReject(): void;
};

interface Location {
    state: {
        payload: {
            challenge: string;
            statements: string;
            url: string;
        };
    };
}

function getIdFromCredential(
    cred: WalletCredential | VerifiableCredential,
    statement: CredentialStatement,
    net: Network
): string {
    return isVerifiableCredentialStatement(statement)
        ? createWeb3IdDIDFromCredential(cred as VerifiableCredential, net)
        : createAccountDID(net, (cred as WalletCredential).credId);
}

async function getAllCredentialStatuses(
    client: ConcordiumGRPCClient,
    credentials: VerifiableCredential[]
): Promise<Record<string, VerifiableCredentialStatus | undefined>> {
    const statuses = await Promise.all(
        credentials.map((credential) =>
            getVerifiableCredentialStatus(client, credential.id)
                .then((status) => [credential.id, status])
                .catch(() => [credential.id, VerifiableCredentialStatus.Pending])
        )
    );
    return Object.fromEntries(statuses);
}

function findCredentialsForStatementIssuer(
    statement: CredentialStatement,
    credentials: WalletCredential[],
    verifiableCredentials: VerifiableCredential[],
    statuses: Record<string, VerifiableCredentialStatus | undefined> | undefined
) {
    if (isAccountCredentialStatement(statement)) {
        return getAccountCredentialsWithMatchingIssuer(statement, credentials);
    }

    if (isVerifiableCredentialStatement(statement)) {
        return getActiveWeb3IdCredentialsWithMatchingIssuer(statement, verifiableCredentials, statuses);
    }

    return undefined;
}

function DisplayNotProvable({
    onClick,
    dappName,
    statement,
    net,
    statuses,
}: {
    onClick: () => void;
    dappName: string;
    statement: CredentialStatement;
    net: Network;
    statuses: Record<string, VerifiableCredentialStatus | undefined> | undefined;
}) {
    const { t } = useTranslation('web3IdProofRequest');
    const credentials = useAtomValue(credentialsAtom);
    const verifiableCredentials = useAtomValue(storedVerifiableCredentialsAtom);
    const validCredentials = findCredentialsForStatementIssuer(
        statement,
        credentials,
        verifiableCredentials.value,
        statuses
    );

    return (
        <ExternalRequestLayout>
            <div className="web3-id-proof-request__statement-container">
                {validCredentials && validCredentials?.length === 0 && (
                    <p className="web3-id-proof-request__not-provable-description bodyM ">
                        {t('descriptions.noCredentialsForThatIssuer')}
                    </p>
                )}
                {validCredentials && validCredentials?.length > 0 && (
                    <>
                        <p className="web3-id-proof-request__not-provable-description bodyM ">
                            {t('descriptions.unableToProve')}
                        </p>
                        <DisplayCredentialStatement
                            className="m-t-10:not-first"
                            dappName={dappName}
                            validCredentials={validCredentials}
                            credentialStatement={statement}
                            net={net}
                            setChosenId={noOp}
                            chosenId={getIdFromCredential(validCredentials[0], statement, net)}
                            showDescription={false}
                        />
                    </>
                )}
                <div className="web3-id-proof-request__actions flex">
                    <Button
                        className="flex-center web3-id-proof-request__not-provable-button flex-child-fill"
                        onClick={onClick}
                    >
                        <CloseIcon className="web3-id-proof-request__reject-icon reject-title" />
                        {t('reject')}
                    </Button>
                </div>
            </div>
        </ExternalRequestLayout>
    );
}

export default function Web3ProofRequest({ onReject, onSubmit }: Props) {
    const { state } = useLocation() as Location;
    const { statements: rawStatements, challenge, url } = state.payload;
    const { onClose, withClose } = useContext(fullscreenPromptContext);
    const { t } = useTranslation('web3IdProofRequest');
    const network = useAtomValue(networkConfigurationAtom);
    const client = useAtomValue(grpcClientAtom);
    const addToast = useSetAtom(addToastAtom);
    const recoveryPhrase = useDecryptedSeedPhrase((e) => addToast(e.message));
    const dappName = displayUrl(url);
    const [creatingProof, setCreatingProof] = useState<boolean>(false);
    const [currentStatementIndex, setCurrentStatementIndex] = useState<number>(0);
    const net = getNet(network);

    const statements: CredentialStatements = useMemo(() => parse(rawStatements), [rawStatements]);

    const [ids, setIds] = useState<string[]>([]);

    const verifiableCredentialSchemas = useAtomValue(storedVerifiableCredentialSchemasAtom);
    const identities = useConfirmedIdentities();
    const credentials = useAtomValue(credentialsAtom);
    const verifiableCredentials = useAtomValue(storedVerifiableCredentialsAtom);

    // TODO filter so that we only look up VC that are viable for some statement
    const statuses = useAsyncMemo(
        () =>
            verifiableCredentials.loading
                ? Promise.resolve(undefined)
                : getAllCredentialStatuses(client, verifiableCredentials.value),
        undefined,
        [verifiableCredentials.loading]
    );

    const validCredentials = useMemo(() => {
        if (identities.loading || verifiableCredentials.loading || !statuses) {
            return undefined;
        }
        return statements.map((statement) => {
            if (isAccountCredentialStatement(statement)) {
                return getViableAccountCredentialsForStatement(statement, identities.value, credentials);
            }
            if (isVerifiableCredentialStatement(statement)) {
                return getViableWeb3IdCredentialsForStatement(statement, verifiableCredentials.value, statuses);
            }
            throw new Error('Unknown statement type');
        });
    }, [identities.loading, verifiableCredentials.loading, Boolean(statuses)]);

    useEffect(() => {
        if (validCredentials) {
            setIds(
                validCredentials.map((creds, index) =>
                    creds[0] ? getIdFromCredential(creds[0], statements[index], net) : ''
                )
            );
        }
    }, [Boolean(validCredentials)]);

    const canProve = useMemo(
        () => validCredentials && validCredentials.every((x) => x.length > 0),
        [Boolean(validCredentials)]
    );

    const handleSubmit = useCallback(async () => {
        if (!recoveryPhrase) {
            throw new Error('Missing recovery phrase');
        }
        if (!network) {
            throw new Error('Network is not specified');
        }

        const global = await getGlobal(client);
        const wallet = ConcordiumHdWallet.fromHex(recoveryPhrase, net);

        const parsedStatements: RequestStatement[] = [];
        const commitmentInputs: CommitmentInput[] = [];

        statements.forEach((statement, index) => {
            if (isAccountCredentialStatement(statement)) {
                const requestStatement = { statement: statement.statement, id: ids[index] };
                parsedStatements.push(requestStatement);
                commitmentInputs.push(
                    getAccountCredentialCommitmentInput(requestStatement, wallet, identities.value, credentials)
                );
            } else {
                const cred = verifiableCredentials.value.find((c) => c.id === ids[index]);

                if (!cred) {
                    throw new Error('The credential was not found for a statement');
                }

                const requestStatement = { statement: statement.statement, id: ids[index], type: cred.type };
                parsedStatements.push(requestStatement);
                commitmentInputs.push(getWeb3CommitmentInput(cred, wallet));
            }
        });

        const request = {
            challenge,
            credentialStatements: parsedStatements,
        };

        return proveWeb3Request(request, commitmentInputs, global);
    }, [recoveryPhrase, network, ids, verifiableCredentials.loading, identities.loading]);

    useEffect(() => onClose(onReject), [onClose, onReject]);

    if (
        verifiableCredentials.loading ||
        verifiableCredentialSchemas.loading ||
        identities.loading ||
        !validCredentials ||
        !ids.length
    ) {
        return null;
    }

    if (!canProve) {
        return (
            <DisplayNotProvable
                onClick={withClose(onReject)}
                dappName={dappName}
                net={net}
                statement={statements[validCredentials.findIndex((v) => !v.length)]}
                statuses={statuses}
            />
        );
    }

    return (
        <ExternalRequestLayout className="web3-id-proof-request__statement-container">
            <DisplayCredentialStatement
                className="m-t-10:not-first"
                dappName={dappName}
                validCredentials={validCredentials[currentStatementIndex]}
                credentialStatement={statements[currentStatementIndex]}
                net={net}
                key={currentStatementIndex}
                chosenId={ids[currentStatementIndex]}
                setChosenId={(newId) =>
                    setIds((currentIds) => {
                        const newIds = [...currentIds];
                        newIds[currentStatementIndex] = newId;
                        return newIds;
                    })
                }
                showDescription
            />
            <div className="web3-id-proof-request__actions flex">
                <div className="web3-id-proof-request__progress">
                    {statements.length > 1 &&
                        statements.map((_, i) => (
                            <Button
                                // eslint-disable-next-line react/no-array-index-key
                                key={i}
                                className={clsx(
                                    'web3-id-proof-request__progress-dot',
                                    currentStatementIndex === i && 'web3-id-proof-request__progress-dot--active'
                                )}
                                clear
                                onClick={() => setCurrentStatementIndex(i)}
                            />
                        ))}
                </div>
                <Button
                    danger
                    className="flex-center web3-id-proof-request__reject-button newButton"
                    disabled={creatingProof}
                    onClick={withClose(onReject)}
                >
                    <CloseIcon className="web3-id-proof-request__reject-icon" />
                </Button>
                {currentStatementIndex > 0 && (
                    <Button
                        disabled={creatingProof}
                        className="flex-center web3-id-proof-request__back-button new-button-styling newButton"
                        onClick={() => setCurrentStatementIndex(currentStatementIndex - 1)}
                    >
                        <BackIcon className="web3-id-proof-request__back-icon" />
                        {t('back')}
                    </Button>
                )}
                {currentStatementIndex === statements.length - 1 ? (
                    <Button
                        className="flex-center web3-id-proof-request__continue-button new-button-styling newButton"
                        onClick={() => {
                            setCreatingProof(true);
                            handleSubmit()
                                .then(withClose(onSubmit))
                                .catch((e) => {
                                    setCreatingProof(false);
                                    addToast(
                                        e.message ? t('failedProofReason', { reason: e.message }) : t('failedProof')
                                    );
                                });
                        }}
                        disabled={creatingProof || !canProve}
                    >
                        {creatingProof ? (
                            <PendingArrows className="loading svg-white web3-id-proof-request__loading-icon" />
                        ) : (
                            t('approve')
                        )}
                    </Button>
                ) : (
                    <Button
                        className="flex-center web3-id-proof-request__continue-button new-button-styling newButton"
                        onClick={() => setCurrentStatementIndex(currentStatementIndex + 1)}
                    >
                        {t('continue')}
                        <ContinueIcon className="web3-id-proof-request__continue-icon" />
                    </Button>
                )}
            </div>
        </ExternalRequestLayout>
    );
}

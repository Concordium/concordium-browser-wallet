import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
    CredentialStatements,
    RequestStatement,
    ConcordiumHdWallet,
    isAccountCredentialStatement,
    Web3IdProofInput,
    ConcordiumGRPCClient,
    CommitmentInput,
    isVerifiableCredentialStatement,
    CredentialStatement,
    Network,
} from '@concordium/web-sdk';
import { InternalMessageType } from '@concordium/browser-wallet-message-hub';

import { popupMessageHandler } from '@popup/shared/message-handler';
import { grpcClientAtom, networkConfigurationAtom } from '@popup/store/settings';
import { credentialsAtom } from '@popup/store/account';
import { addToastAtom } from '@popup/state';
import { useDecryptedSeedPhrase } from '@popup/shared/utils/seed-phrase-helpers';
import { getGlobal, getNet } from '@shared/utils/network-helpers';
import { BackgroundResponseStatus, ProofBackgroundResponse } from '@shared/utils/types';
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
import { stringify } from '@concordium/browser-wallet-api/src/util';
import CloseIcon from '@assets/svg/cross.svg';
import {
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
                            showDescription={false}
                        />
                    </>
                )}
                <div className="web3-id-proof-request__actions flex">
                    <Button className="web3-id-proof-request__not-provable-button flex-child-fill" onClick={onClick}>
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

    const [ids, setIds] = useState<string[]>(Array(statements.length).fill(''));

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

        const input: Web3IdProofInput = {
            request,
            commitmentInputs,
            globalContext: global,
        };

        const result: ProofBackgroundResponse<string> = await popupMessageHandler.sendInternalMessage(
            InternalMessageType.CreateWeb3IdProof,
            stringify(input)
        );

        if (result.status !== BackgroundResponseStatus.Success) {
            throw new Error(result.reason);
        }
        return result.proof;
    }, [recoveryPhrase, network, ids, verifiableCredentials.loading, identities.loading]);

    useEffect(() => onClose(onReject), [onClose, onReject]);

    if (
        verifiableCredentials.loading ||
        verifiableCredentialSchemas.loading ||
        identities.loading ||
        !validCredentials
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
                <Button
                    danger
                    className="web3-id-proof-request__reject-button"
                    disabled={creatingProof}
                    onClick={withClose(onReject)}
                >
                    <CloseIcon className="web3-id-proof-request__reject-icon" />
                </Button>
                {currentStatementIndex > 0 && (
                    <Button
                        disabled={creatingProof}
                        className="web3-id-proof-request__back-button new-button-styling"
                        onClick={() => setCurrentStatementIndex(currentStatementIndex - 1)}
                    >
                        {t('back')}
                    </Button>
                )}
                {currentStatementIndex === statements.length - 1 ? (
                    <Button
                        className="flex-center web3-id-proof-request__continue-button new-button-styling"
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
                        className="flex-center web3-id-proof-request__continue-button new-button-styling"
                        onClick={() => setCurrentStatementIndex(currentStatementIndex + 1)}
                    >
                        {t('continue')}
                    </Button>
                )}
            </div>
        </ExternalRequestLayout>
    );
}

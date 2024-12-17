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
import { noOp, useAsyncMemo } from 'wallet-common-helpers';

import { grpcClientAtom, networkConfigurationAtom } from '@popup/store/settings';
import { credentialsAtom } from '@popup/store/account';
import { addToastAtom } from '@popup/state';
import { useDecryptedSeedPhrase } from '@popup/shared/utils/seed-phrase-helpers';
import { getGlobal, getNet } from '@shared/utils/network-helpers';
import { displayUrl } from '@popup/shared/utils/string-helpers';
import {
    storedVerifiableCredentialsAtom,
    storedVerifiableCredentialSchemasAtom,
} from '@popup/store/verifiable-credential';
import { useConfirmedIdentities } from '@popup/shared/utils/identity-helpers';
import { parse } from '@shared/utils/payload-helpers';
import { VerifiableCredential, VerifiableCredentialStatus, WalletCredential } from '@shared/storage/types';
import { getVerifiableCredentialStatus } from '@shared/utils/verifiable-credential-helpers';
import { proveWeb3Request } from '@shared/utils/proof-helpers';
import Button from '@popup/popupX/shared/Button';
import Page from '@popup/popupX/shared/Page';
import { fullscreenPromptContext } from '@popup/popupX/page-layouts/FullscreenPromptLayout';
import FullscreenNotice from '@popup/popupX/shared/FullscreenNotice';
import { LoaderInline } from '@popup/popupX/shared/Loader';
import Card from '@popup/popupX/shared/Card';
import Text from '@popup/popupX/shared/Text';
import CheckCircle from '@assets/svgX/check-circle.svg';
import Cross from '@assets/svgX/close.svg';

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
    const { t } = useTranslation('x', { keyPrefix: 'prompts.verifiablePresentationRequest' });
    const credentials = useAtomValue(credentialsAtom);
    const verifiableCredentials = useAtomValue(storedVerifiableCredentialsAtom);
    const validCredentials = findCredentialsForStatementIssuer(
        statement,
        credentials,
        verifiableCredentials.value,
        statuses
    );

    return (
        <Page>
            <Page.Top heading={t('title')} />
            <div className="verifiable-presentation-request__statement-container">
                {validCredentials && validCredentials?.length === 0 && (
                    <p className="verifiable-presentation-request__not-provable-description bodyM ">
                        {t('descriptions.noCredentialsForThatIssuer')}
                    </p>
                )}
                {validCredentials && validCredentials?.length > 0 && (
                    <>
                        <p className="verifiable-presentation-request__not-provable-description bodyM ">
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
                <Page.Footer>
                    <Button.Secondary onClick={onClick} label={t('reject')} />
                </Page.Footer>
            </div>
        </Page>
    );
}

type ProgressPromptProps = {
    onSuccess(proof: string): void;
    onError(message: string): void;
    proof: Promise<string> | undefined;
};

export function ProgressPrompt({ proof, onSuccess, onError }: ProgressPromptProps) {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.verifiablePresentationRequest.progress' });
    const value = useAsyncMemo(async () => proof?.catch((e) => new Error(e.message ?? undefined)), noOp, [proof]);

    const onContinue = () => {
        if (value === undefined) {
            throw new Error('Unreachable');
        }

        if (typeof value === 'string') {
            onSuccess(value);
        } else {
            onError(value?.message ? t('failedProofReason', { reason: value.message }) : t('failedProof'));
        }
    };

    return (
        <FullscreenNotice open={proof !== undefined} header={false}>
            <Page className="verifiable-presentation-request__progress-prompt">
                <Card type="transparent" className="flex justify-center">
                    {value === undefined && (
                        <>
                            <LoaderInline />
                            <Text.Capture className="block m-t-10">{t('inProgress')}</Text.Capture>
                        </>
                    )}
                    {typeof value === 'string' && (
                        <>
                            <CheckCircle />
                            <Text.Capture className="block m-t-10">{t('success')}</Text.Capture>
                        </>
                    )}
                    {value instanceof Error && (
                        <>
                            <Cross className="failed-icon" />
                            <Text.Capture className="block m-t-10">{t('failed')}</Text.Capture>
                            {value.message && (
                                <Text.Capture className="block m-t-10 error">{value.message}</Text.Capture>
                            )}
                        </>
                    )}
                </Card>
                {value !== undefined && (
                    <Page.Footer>
                        <Button.Main label={t('buttonClose')} onClick={onContinue} />
                    </Page.Footer>
                )}
            </Page>
        </FullscreenNotice>
    );
}

export default function Web3ProofRequest({ onReject, onSubmit }: Props) {
    const { state } = useLocation() as Location;
    const { statements: rawStatements, challenge, url } = state.payload;
    const { onClose, withClose } = useContext(fullscreenPromptContext);
    const { t } = useTranslation('x', { keyPrefix: 'prompts.verifiablePresentationRequest' });
    const network = useAtomValue(networkConfigurationAtom);
    const client = useAtomValue(grpcClientAtom);
    const addToast = useSetAtom(addToastAtom);
    const recoveryPhrase = useDecryptedSeedPhrase((e) => addToast(e.message));
    const dappName = displayUrl(url);
    const [creatingProof, setCreatingProof] = useState<boolean>(false);
    const [currentStatementIndex, setCurrentStatementIndex] = useState<number>(0);
    const net = getNet(network);
    const [proof, setProof] = useState<Promise<string>>();

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

        setProof(proveWeb3Request(request, commitmentInputs, global));
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
        <>
            <ProgressPrompt proof={proof} onSuccess={withClose(onSubmit)} onError={withClose(onReject)} />
            <Page>
                <Page.Top heading={t('title')} />
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
                <Page.Footer>
                    <div className="verifiable-presentation-request__progress">
                        {statements.length > 1 &&
                            statements.map((_, i) => (
                                <Button.Base
                                    // eslint-disable-next-line react/no-array-index-key
                                    key={i}
                                    className={clsx(
                                        'verifiable-presentation-request__progress-dot',
                                        currentStatementIndex === i &&
                                            'verifiable-presentation-request__progress-dot--active'
                                    )}
                                    onClick={() => setCurrentStatementIndex(i)}
                                />
                            ))}
                    </div>
                    <Button.Main
                        className="secondary"
                        disabled={creatingProof}
                        onClick={withClose(onReject)}
                        label={t('reject')}
                    />
                    {currentStatementIndex > 0 && (
                        <Button.Main
                            className="secondary"
                            disabled={creatingProof}
                            onClick={() => setCurrentStatementIndex(currentStatementIndex - 1)}
                            label={t('back')}
                        />
                    )}
                    {currentStatementIndex === statements.length - 1 ? (
                        <Button.Main
                            onClick={() => {
                                setCreatingProof(true);
                                handleSubmit();
                            }}
                            disabled={creatingProof || !canProve}
                            label={t('approve')}
                        />
                    ) : (
                        <Button.Main
                            onClick={() => setCurrentStatementIndex(currentStatementIndex + 1)}
                            label={t('continue')}
                        />
                    )}
                </Page.Footer>
            </Page>
        </>
    );
}

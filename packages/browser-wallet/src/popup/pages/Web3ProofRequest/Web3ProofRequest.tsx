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
import ButtonGroup from '@popup/shared/ButtonGroup';
import { displayUrl } from '@popup/shared/utils/string-helpers';
import {
    storedVerifiableCredentialsAtom,
    storedVerifiableCredentialSchemasAtom,
} from '@popup/store/verifiable-credential';
import { useConfirmedIdentities } from '@popup/shared/utils/identity-helpers';
import { parse } from '@shared/utils/payload-helpers';
import { VerifiableCredential, VerifiableCredentialStatus } from '@shared/storage/types';
import { getVerifiableCredentialStatus } from '@shared/utils/verifiable-credential-helpers';
import { useAsyncMemo } from 'wallet-common-helpers';
import { getCommitmentInput } from './utils';
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
            getVerifiableCredentialStatus(client, credential.id).then((status) => [credential.id, status])
        )
    );
    return Object.fromEntries(statuses);
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

    const canProve = useMemo(() => ids.every((x) => Boolean(x)), [ids]);

    // TODO filter so that we only look up VC that are viable for some statement
    const statuses = useAsyncMemo(
        () =>
            verifiableCredentials.loading
                ? Promise.resolve(undefined)
                : getAllCredentialStatuses(client, verifiableCredentials.value),
        undefined,
        [verifiableCredentials.loading]
    );

    const handleSubmit = useCallback(async () => {
        if (!recoveryPhrase) {
            throw new Error('Missing recovery phrase');
        }
        if (!network) {
            throw new Error('Network is not specified');
        }
        if (!canProve) {
            throw new Error('The statements are not satisfied and cannot be proven');
        }

        const global = await getGlobal(client);
        const wallet = ConcordiumHdWallet.fromHex(recoveryPhrase, net);

        const type = ['ConcordiumVerifiableCredential', 'TestCredential', 'VerifiableCredential'];

        const parsedStatements: RequestStatement[] = statements.map((statement, index) => {
            if (isAccountCredentialStatement(statement)) {
                return { statement: statement.statement, id: ids[index] };
            }
            return { statement: statement.statement, id: ids[index], type };
        });

        const commitmentInputs = parsedStatements.map((statement) =>
            getCommitmentInput(statement, wallet, identities.value, credentials, verifiableCredentials.value)
        );

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
            input
        );

        if (result.status !== BackgroundResponseStatus.Success) {
            throw new Error(result.reason);
        }
        return result.proof;
    }, [recoveryPhrase, network, ids, verifiableCredentials.loading, identities.loading, canProve]);

    useEffect(() => onClose(onReject), [onClose, onReject]);

    if (verifiableCredentials.loading || verifiableCredentialSchemas.loading || identities.loading || !statuses) {
        return null;
    }

    return (
        <ExternalRequestLayout>
            <div className="web3-id-proof-request__statement-container">
                <DisplayCredentialStatement
                    className="m-t-10:not-first"
                    dappName={dappName}
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
                    statuses={statuses}
                />
                <ButtonGroup className="web3-id-proof-request__actions">
                    <Button disabled={creatingProof} onClick={withClose(onReject)}>
                        {t('reject')}
                    </Button>
                    {currentStatementIndex === statements.length - 1 ? (
                        <Button
                            className="flex-center"
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
                                t('accept')
                            )}
                        </Button>
                    ) : (
                        <Button
                            className="flex-center"
                            onClick={() => setCurrentStatementIndex(currentStatementIndex + 1)}
                        >
                            {t('continue')}
                        </Button>
                    )}
                </ButtonGroup>
            </div>
        </ExternalRequestLayout>
    );
}

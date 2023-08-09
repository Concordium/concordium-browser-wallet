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
import { DisplayCredentialStatement } from './DisplayStatement';
import { getCommitmentInput } from './utils';

type Props = {
    onSubmit(presentationString: string): void;
    onReject(): void;
};

interface Location {
    state: {
        payload: {
            challenge: string;
            statements: CredentialStatements;
            url: string;
        };
    };
}

export default function Web3ProofRequest({ onReject, onSubmit }: Props) {
    const { state } = useLocation() as Location;
    const { statements, challenge, url } = state.payload;
    const { onClose, withClose } = useContext(fullscreenPromptContext);
    const { t } = useTranslation('idProofRequest');
    const network = useAtomValue(networkConfigurationAtom);
    const client = useAtomValue(grpcClientAtom);
    const addToast = useSetAtom(addToastAtom);
    const recoveryPhrase = useDecryptedSeedPhrase((e) => addToast(e.message));
    const dappName = displayUrl(url);
    const [creatingProof, setCreatingProof] = useState<boolean>(false);
    const net = getNet(network);

    const verifiableCredentialSchemas = useAtomValue(storedVerifiableCredentialSchemasAtom);
    const identities = useConfirmedIdentities();
    const credentials = useAtomValue(credentialsAtom);
    const verifiableCredentials = useAtomValue(storedVerifiableCredentialsAtom);

    const [ids, setIds] = useState<string[]>(statements.map(() => ''));

    const canProve = useMemo(() => ids.every((x) => Boolean(x)), [ids]);

    const handleSubmit = useCallback(async () => {
        if (!recoveryPhrase) {
            throw new Error('Missing recovery phrase');
        }
        if (!network) {
            throw new Error('Network is not specified');
        }
        if (!ids.every((x) => Boolean(x))) {
            throw new Error('Network is not specified');
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
            getCommitmentInput(
                statement,
                wallet,
                identities.value,
                credentials,
                verifiableCredentials || [],
                verifiableCredentialSchemas.value
            )
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
            InternalMessageType.CreateWeb3Proof,
            input
        );

        if (result.status !== BackgroundResponseStatus.Success) {
            throw new Error(result.reason);
        }
        return result.proof;
    }, [recoveryPhrase, network, ids]);

    useEffect(() => onClose(onReject), [onClose, onReject]);

    if (verifiableCredentialSchemas.loading || identities.loading) {
        return null;
    }

    return (
        <ExternalRequestLayout>
            <div className="web3-id-proof-request__statement-container">
                {statements.map((s, index) => (
                    <DisplayCredentialStatement
                        className="m-t-10:not-first"
                        dappName={dappName}
                        credentialStatement={s}
                        net={net}
                        // eslint-disable-next-line react/no-array-index-key
                        key={index} // Allow this, as we don't expect these to ever change.
                        setChosenId={(newId) =>
                            setIds((currentIds) => {
                                const newIds = [...currentIds];
                                newIds[index] = newId;
                                return newIds;
                            })
                        }
                    />
                ))}
                <ButtonGroup className="web3-id-proof-request__actions">
                    <Button disabled={creatingProof} onClick={withClose(onReject)}>
                        {t('reject')}
                    </Button>
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
                </ButtonGroup>
            </div>
        </ExternalRequestLayout>
    );
}

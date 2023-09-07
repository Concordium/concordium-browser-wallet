import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
    CredentialStatements,
    AtomicStatementV2,
    getPastDate,
    MIN_DATE,
    createAccountDID,
    ConcordiumHdWallet,
    isAccountCredentialStatement,
    StatementTypes,
    AttributeKeyString,
} from '@concordium/web-sdk';

import { grpcClientAtom, networkConfigurationAtom, sessionPasscodeAtom } from '@popup/store/settings';
import { addToastAtom } from '@popup/state';
import { useDecryptedSeedPhrase } from '@popup/shared/utils/seed-phrase-helpers';
import { getGlobal, getNet } from '@shared/utils/network-helpers';
import PendingArrows from '@assets/svg/pending-arrows.svg';
import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import Button from '@popup/shared/Button';
import { displayUrl } from '@popup/shared/utils/string-helpers';
import { absoluteRoutes } from '@popup/constants/routes';
import Logo from '@assets/svg/concordium-with-letters.svg';
import { parse } from '@shared/utils/payload-helpers';
import { credentialsAtomWithLoading } from '@popup/store/account';
import { useConfirmedIdentities } from '@popup/shared/utils/identity-helpers';
import { isIdentityOfCredential } from '@shared/utils/identity-helpers';
import Toast from '@popup/shared/Toast';
import { logError } from '@shared/utils/log-helpers';
import { proveWeb3Request } from '@shared/utils/proof-helpers';
import Web3ProofRequest from '../Web3ProofRequest/Web3ProofRequest';
import {
    checkIfAccountCredentialIsViableForStatement,
    getAccountCredentialCommitmentInput,
} from '../Web3ProofRequest/utils';
import { addDays, getYearFromDateString } from '../IdProofRequest/DisplayStatement/utils';

type Props = {
    onSubmit(proof: string): void;
    onReject(): void;
};

interface Location {
    state: {
        payload: {
            statements: string;
            challenge: string;
            url: string;
        };
    };
}

function useAgeFromStatement(statement: AtomicStatementV2) {
    if (
        statement.type !== StatementTypes.AttributeInRange ||
        statement.attributeTag !== AttributeKeyString.dob ||
        typeof statement.lower !== 'string' ||
        typeof statement.upper !== 'string'
    ) {
        throw new Error('unexpected');
    }

    const today = getPastDate(0);

    const ageMin = getYearFromDateString(today) - getYearFromDateString(addDays(statement.upper, -1));
    const ageMax = getYearFromDateString(today) - getYearFromDateString(addDays(statement.lower, -1)) - 1;

    if (statement.lower === MIN_DATE) {
        return { ageMin };
    }

    if (statement.upper > today) {
        return { ageMax };
    }

    return { ageMin, ageMax };
}

export default function AgeProofRequest({ onReject, onSubmit }: Props) {
    const { state } = useLocation() as Location;
    const { statements: rawStatements, challenge, url } = state.payload;
    const { onClose, withClose } = useContext(fullscreenPromptContext);
    const { t } = useTranslation('ageProofRequest');
    const [more, setMore] = useState(false);

    const statements: CredentialStatements = useMemo(() => parse(rawStatements), [rawStatements]);
    const statement = statements[0].statement[0];

    const identities = useConfirmedIdentities();
    const credentials = useAtomValue(credentialsAtomWithLoading);

    const credential = useMemo(() => {
        const credentialStatement = statements[0];
        if (!isAccountCredentialStatement(credentialStatement)) {
            throw new Error('Unexpected credential statement type');
        }

        return credentials.value.find((cred) =>
            checkIfAccountCredentialIsViableForStatement(credentialStatement, cred, identities.value)
        );
    }, [identities.loading, credentials.loading]);

    const identity = credential ? identities.value.find((id) => isIdentityOfCredential(id)(credential)) : undefined;

    const canProve = Boolean(credential);

    const network = useAtomValue(networkConfigurationAtom);
    const client = useAtomValue(grpcClientAtom);
    const addToast = useSetAtom(addToastAtom);
    const recoveryPhrase = useDecryptedSeedPhrase(logError);
    const dappName = displayUrl(url);
    const [creatingProof, setCreatingProof] = useState<boolean>(false);
    const { loading: loadingPasscode, value: sessionPasscode } = useAtomValue(sessionPasscodeAtom);

    const age = useAgeFromStatement(statement);

    const handleSubmit = useCallback(async () => {
        if (!recoveryPhrase) {
            throw new Error('Missing recovery phrase');
        }
        if (!network) {
            throw new Error('Network is not specified');
        }
        if (!credential) {
            throw new Error('credential is not loaded');
        }

        const net = getNet(network);

        const global = await getGlobal(client);
        const wallet = ConcordiumHdWallet.fromHex(recoveryPhrase, net);

        const requestStatement = { statement: [statement], id: createAccountDID(net, credential?.credId) };

        const commitmentInput = getAccountCredentialCommitmentInput(
            requestStatement,
            wallet,
            identities.value,
            credentials.value
        );

        const request = {
            challenge,
            credentialStatements: [requestStatement],
        };

        return proveWeb3Request(request, [commitmentInput], global);
    }, [credential, identity, recoveryPhrase, network]);

    useEffect(() => onClose(onReject), [onClose, onReject]);

    const description = useMemo(() => {
        if (!age) {
            return '';
        }
        const { ageMin, ageMax } = age;

        if (ageMax === undefined) {
            return t('ageMin', { age: ageMin });
        }

        if (ageMin === undefined) {
            return t('ageMax', { age: ageMax });
        }

        if (ageMin === ageMax) {
            return t('ageExact', { age: ageMin });
        }

        return t('ageBetween', { ageMin, ageMax });
    }, [age]);

    if (loadingPasscode) {
        // This will be near instant, as we're just waiting for the Chrome async store
        return null;
    }

    if (!sessionPasscode) {
        return <Navigate to={absoluteRoutes.login.path} state={{ to: -1 }} />;
    }

    if (more) {
        return <Web3ProofRequest onSubmit={onSubmit} onReject={onReject} />;
    }

    return (
        <div className="age-proof__request">
            <Toast />
            <div>
                <div className="age-proof__logos">
                    <Logo className="age-proof__logo" />
                </div>
                <h3 className="age-proof__description">{description}</h3>
                <Button clear onClick={() => setMore(true)} className="age-proof__more-details">
                    {t('moreDetails', { dappName })}
                </Button>
            </div>
            <Button
                className="flex-center age-proof__verify-button m-20"
                onClick={() => {
                    setCreatingProof(true);
                    handleSubmit()
                        .then(withClose(onSubmit))
                        .catch((e) => {
                            setCreatingProof(false);
                            logError(e);
                            addToast(t('failure'));
                        });
                }}
                disabled={!canProve || creatingProof}
            >
                {creatingProof ? (
                    <PendingArrows className="loading svg-white id-proof-request__loading-icon" />
                ) : (
                    t(canProve ? 'verify' : 'notAbleToVerify')
                )}
            </Button>
        </div>
    );
}

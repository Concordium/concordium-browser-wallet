import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAtomValue, useSetAtom } from 'jotai';
import { Trans, useTranslation } from 'react-i18next';
import { IdStatement, StatementTypes, RevealStatement, IdProofOutput } from '@concordium/web-sdk';
import { InternalMessageType } from '@messaging';

import { popupMessageHandler } from '@popup/shared/message-handler';
import { identityByAddressAtomFamily } from '@popup/store/identity';
import { useCredential } from '@popup/shared/utils/account-helpers';
import { grpcClientAtom, networkConfigurationAtom } from '@popup/store/settings';
import { addToastAtom } from '@popup/state';
import { useDecryptedSeedPhrase } from '@popup/shared/utils/seed-phrase-helpers';
import { getGlobal, getNet } from '@shared/utils/network-helpers';
import { BackgroundResponseStatus, ProofBackgroundResponse } from '@shared/utils/types';
import { fullscreenPromptContext } from '@popup/popupX/page-layouts/FullscreenPromptLayout';
import { displayUrl } from '@popup/shared/utils/string-helpers';
import { noOp, useAsyncMemo } from 'wallet-common-helpers';
import FullscreenNotice from '@popup/popupX/shared/FullscreenNotice';
import Page from '@popup/popupX/shared/Page';
import { LoaderInline } from '@popup/popupX/shared/Loader';
import Card from '@popup/popupX/shared/Card';
import Button from '@popup/popupX/shared/Button';
import Text from '@popup/popupX/shared/Text';
import CheckCircle from '@assets/svgX/check-circle.svg';
import Cross from '@assets/svgX/close.svg';

import { DisplayRevealStatement, DisplaySecretStatement } from './DisplayStatement';
import { SecretStatement } from './DisplayStatement/utils';

type Props = {
    onSubmit(proof: IdProofOutput): void;
    onReject(reason?: string): void;
};

interface Location {
    state: {
        payload: {
            accountAddress: string;
            statement: IdStatement;
            challenge: string;
            url: string;
        };
    };
}

type ProgressPromptProps<P> = {
    onSuccess(proof: P): void;
    onError(message: string): void;
    onClose(): void;
    proof: Promise<P> | undefined;
};

export function ProofStatusPrompt<P>({ proof, onSuccess, onError, onClose }: ProgressPromptProps<P>) {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.idProofRequestX.status' });
    const value = useAsyncMemo(async () => proof?.catch((e) => new Error(e.message ?? undefined)), noOp, [proof]);

    useEffect(() => {
        if (value === undefined) {
            return;
        }

        if (value instanceof Error) {
            onError(value.message ? t('failedProofReason', { reason: value.message }) : t('failedProof'));
        } else {
            onSuccess(value);
        }
    }, [value]);

    return (
        <FullscreenNotice open={proof !== undefined} header={false}>
            <Page className="id-proof-request-x__status-prompt">
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
                        <Button.Main label={t('buttonClose')} onClick={onClose} />
                    </Page.Footer>
                )}
            </Page>
        </FullscreenNotice>
    );
}

export default function IdProofRequest({ onReject, onSubmit }: Props) {
    const { state } = useLocation() as Location;
    const { statement, challenge, url, accountAddress: account } = state.payload;
    const { onClose, withClose } = useContext(fullscreenPromptContext);
    const { t } = useTranslation('x', { keyPrefix: 'prompts.idProofRequestX' });
    const { loading: identityLoading, value: identity } = useAtomValue(identityByAddressAtomFamily(account));
    const credential = useCredential(account);
    const network = useAtomValue(networkConfigurationAtom);
    const client = useAtomValue(grpcClientAtom);
    const addToast = useSetAtom(addToastAtom);
    const recoveryPhrase = useDecryptedSeedPhrase((e) => addToast(e.message));
    const dappName = displayUrl(url);
    const [creatingProof, setCreatingProof] = useState<boolean>(false);
    const [canProve, setCanProve] = useState(statement.length > 0);
    const reveals = statement.filter((s) => s.type === StatementTypes.RevealAttribute) as RevealStatement[];
    const secrets = statement.filter((s) => s.type !== StatementTypes.RevealAttribute) as SecretStatement[];
    const [proof, setProof] = useState<Promise<IdProofOutput>>();

    const handleSubmit = useCallback(async () => {
        if (!identity) {
            throw new Error('Missing identity');
        }
        if (!recoveryPhrase) {
            throw new Error('Missing recovery phrase');
        }
        if (!network) {
            throw new Error('Network is not specified');
        }
        if (!credential) {
            throw new Error('Missing credential');
        }

        const global = await getGlobal(client);

        const idProofResult: ProofBackgroundResponse<IdProofOutput> = await popupMessageHandler.sendInternalMessage(
            InternalMessageType.CreateIdProof,
            {
                identityIndex: credential.identityIndex,
                identityProviderIndex: credential.providerIndex,
                credNumber: credential.credNumber,
                idObject: identity.idObject.value,
                seedAsHex: recoveryPhrase,
                net: getNet(network),
                globalContext: global,
                statement,
                challenge,
            }
        );

        if (idProofResult.status !== BackgroundResponseStatus.Success) {
            throw new Error(idProofResult.reason);
        }
        return idProofResult.proof;
    }, [credential, identity, recoveryPhrase, network]);

    useEffect(() => onClose(onReject), [onClose, onReject]);

    const handleInvalidStatement = useCallback(() => {
        if (canProve) {
            setCanProve(false);
        }
    }, [canProve]);

    if (identityLoading || !identity) {
        return null;
    }

    return (
        <>
            <ProofStatusPrompt proof={proof} onSuccess={onSubmit} onError={onReject} onClose={withClose(noOp)} />
            <Page className="id-proof-request-x">
                <Page.Top heading={t('title')} />
                <Text.Main>
                    <Trans
                        t={t}
                        i18nKey="header"
                        components={{ 1: <span className="white" /> }}
                        values={{ dappName }}
                    />
                </Text.Main>
                {reveals.length !== 0 && (
                    <DisplayRevealStatement
                        dappName={dappName}
                        identity={identity}
                        statements={reveals}
                        onInvalid={handleInvalidStatement}
                    />
                )}
                {secrets.map((s, i) => (
                    <DisplaySecretStatement
                        // eslint-disable-next-line react/no-array-index-key
                        key={i} // Allow this, as we don't expect these to ever change.
                        dappName={dappName}
                        identity={identity}
                        statement={s}
                        onInvalid={handleInvalidStatement}
                    />
                ))}
                <Page.Footer>
                    <Button.Main
                        className="secondary m-t-20"
                        disabled={creatingProof}
                        onClick={() => withClose(onReject)()}
                        label={t('reject')}
                    />
                    <Button.Main
                        onClick={() => {
                            setCreatingProof(true);
                            setProof(handleSubmit());
                        }}
                        disabled={creatingProof || !canProve}
                        label={t('accept')}
                    />
                </Page.Footer>
            </Page>
        </>
    );
}

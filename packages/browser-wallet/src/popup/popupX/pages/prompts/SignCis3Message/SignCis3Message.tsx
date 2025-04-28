import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSetAtom } from 'jotai';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import Button from '@popup/popupX/shared/Button';
import { usePrivateKey } from '@popup/shared/utils/account-helpers';
import { fullscreenPromptContext } from '@popup/popupX/page-layouts/FullscreenPromptLayout';
import Card from '@popup/popupX/shared/Card';
import {
    AccountAddress,
    AccountTransactionSignature,
    buildBasicAccountSigner,
    ContractAddress,
    ContractName,
    deserializeTypeValue,
    EntrypointName,
    serializeTypeValue,
    signMessage,
} from '@concordium/web-sdk';
import { addToastAtom } from '@popup/state';
import { useLocation } from 'react-router-dom';
import { SignMessageObject } from '@concordium/browser-wallet-api-helpers';
import { Buffer } from 'buffer';
import { stringify } from 'json-bigint';
import Parameter from '@popup/popupX/shared/Parameter';
import { displayUrl } from '@popup/shared/utils/string-helpers';

const SERIALIZATION_HELPER_SCHEMA =
    'FAAFAAAAEAAAAGNvbnRyYWN0X2FkZHJlc3MMBQAAAG5vbmNlBQkAAAB0aW1lc3RhbXANCwAAAGVudHJ5X3BvaW50FgEHAAAAcGF5bG9hZBABAg==';

async function parseMessage(message: SignMessageObject) {
    return stringify(
        deserializeTypeValue(Buffer.from(message.data, 'hex'), Buffer.from(message.schema, 'base64')),
        undefined,
        2
    );
}

function useMessageDetails({
    payloadMessage,
    cis3ContractDetails,
}: {
    payloadMessage: SignMessageObject;
    cis3ContractDetails: Cis3ContractDetailsObject;
}) {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.signCis3' });
    const { contractAddress, contractName, entrypointName, nonce, expiryTimeSignature } = cis3ContractDetails;
    const [parsedMessage, setParsedMessage] = useState<string>('');
    const expiry = new Date(expiryTimeSignature).toString();

    useEffect(() => {
        parseMessage(payloadMessage)
            .then((m) => setParsedMessage(m))
            .catch(() => setParsedMessage(t('unableToDeserialize')));
    }, []);

    return {
        mainDetails: [
            [t('contractIndex'), `${contractAddress.index.toString()} (${contractAddress.subindex.toString()})`],
            [t('receiveName'), `${contractName.value.toString()}.${entrypointName.value.toString()}`],
            [t('nonce'), nonce.toString()],
            [t('expiry'), expiry],
        ],
        parsedMessage,
    };
}

function serializeMessage(payloadMessage: SignMessageObject, cis3ContractDetails: Cis3ContractDetailsObject) {
    const { contractAddress, entrypointName, nonce, expiryTimeSignature } = cis3ContractDetails;
    const message = {
        contract_address: {
            index: Number(contractAddress.index),
            subindex: Number(contractAddress.subindex),
        },
        nonce: Number(nonce),
        timestamp: expiryTimeSignature,
        entry_point: EntrypointName.toString(entrypointName),
        payload: Array.from(Buffer.from(payloadMessage.data, 'hex')),
    };

    return serializeTypeValue(message, Buffer.from(SERIALIZATION_HELPER_SCHEMA, 'base64'));
}

interface Location {
    state: {
        payload: {
            accountAddress: string;
            message: SignMessageObject;
            url: string;
            cis3ContractDetails: Cis3ContractDetailsObject;
        };
    };
}

type Cis3ContractDetailsObject = {
    contractAddress: ContractAddress.Type;
    contractName: ContractName.Type;
    entrypointName: EntrypointName.Type;
    nonce: bigint | number;
    expiryTimeSignature: string;
};

type Props = {
    onSubmit(signature: AccountTransactionSignature): void;
    onReject(): void;
};

export default function SignCis3Message({ onSubmit, onReject }: Props) {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.signCis3' });
    const { state } = useLocation() as Location;
    const { withClose } = useContext(fullscreenPromptContext);
    const { accountAddress, message, url, cis3ContractDetails } = state.payload;
    const { mainDetails, parsedMessage } = useMessageDetails({ payloadMessage: message, cis3ContractDetails });
    const key = usePrivateKey(accountAddress);
    const addToast = useSetAtom(addToastAtom);
    const onClick = useCallback(async () => {
        if (!key) {
            throw new Error('Missing key for the chosen address');
        }

        return signMessage(
            AccountAddress.fromBase58(accountAddress),
            serializeMessage(message, cis3ContractDetails).buffer,
            buildBasicAccountSigner(key)
        );
    }, [state.payload.message, state.payload.accountAddress, key]);

    return (
        <Page className="sign-cis3-x">
            <Page.Top heading={t('signRequest')} />
            <Page.Main>
                <Text.Main>
                    <Trans
                        ns="x"
                        i18nKey="prompts.signCis3.signTransaction"
                        components={{ 1: <span className="white" /> }}
                        values={{ dApp: displayUrl(url) }}
                    />
                </Text.Main>
                <Text.Capture>
                    <Trans
                        ns="x"
                        i18nKey="prompts.signCis3.connectionDetails"
                        components={{ 1: <span className="white" /> }}
                        values={{ dApp: displayUrl(url) }}
                    />
                </Text.Capture>
                <Card>
                    {mainDetails.map(([title, value]) => (
                        <Card.RowDetails key={title} title={title} value={value} />
                    ))}
                    <Parameter value={parsedMessage} />
                </Card>
            </Page.Main>
            <Page.Footer>
                <Button.Main className="secondary" label={t('reject')} onClick={withClose(onReject)} />
                <Button.Main
                    label={t('sign')}
                    onClick={() => {
                        onClick()
                            .then(withClose(onSubmit))
                            .catch((e) => addToast(e.message));
                    }}
                />
            </Page.Footer>
        </Page>
    );
}

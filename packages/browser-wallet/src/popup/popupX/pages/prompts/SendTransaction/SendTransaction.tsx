import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { BackgroundSendTransactionPayload } from '@shared/utils/types';
import { useLocation } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { useAtomValue, useSetAtom } from 'jotai';
import { addToastAtom } from '@popup/state';
import { grpcClientAtom } from '@popup/store/settings';
import { fullscreenPromptContext } from '@popup/popupX/page-layouts/FullscreenPromptLayout';
import { useUpdateAtom } from 'jotai/utils';
import { addPendingTransactionAtom } from '@popup/store/transactions';
import { useBlockChainParameters } from '@popup/shared/BlockChainParametersProvider';
import { usePrivateKey } from '@popup/shared/utils/account-helpers';
import { parsePayload } from '@shared/utils/payload-helpers';
import * as JSONBig from 'json-bigint';
import { SmartContractParameters } from '@concordium/browser-wallet-api-helpers';
import { AccountAddress, convertEnergyToMicroCcd, getEnergyCost } from '@concordium/web-sdk';
import { displayAsCcd, getPublicAccountAmounts } from 'wallet-common-helpers';
import {
    createPendingTransactionFromAccountTransaction,
    getDefaultExpiry,
    getTransactionAmount,
    getTransactionTypeName,
    sendTransaction,
} from '@popup/shared/utils/transaction-helpers';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import { displayUrl } from '@popup/shared/utils/string-helpers';
import Button from '@popup/popupX/shared/Button';
import Card from '@popup/popupX/shared/Card';
import DisplayTransactionPayload, {
    DisplayParameters,
} from '@popup/popupX/pages/prompts/SendTransaction/DisplayTransactionPayload';

interface Location {
    state: {
        payload: BackgroundSendTransactionPayload;
    };
}

interface Props {
    onSubmit(hash: string): void;
    onReject(): void;
}

export default function SendTransaction({ onSubmit, onReject }: Props) {
    const { state } = useLocation() as Location;
    const { t } = useTranslation('x', { keyPrefix: 'prompts.sendTransactionX' });
    const addToast = useSetAtom(addToastAtom);
    const client = useAtomValue(grpcClientAtom);
    const { withClose, onClose } = useContext(fullscreenPromptContext);
    const addPendingTransaction = useUpdateAtom(addPendingTransactionAtom);
    const chainParameters = useBlockChainParameters();

    const { accountAddress, url } = state.payload;
    const key = usePrivateKey(accountAddress);

    const { type: transactionType, payload } = useMemo(
        () =>
            parsePayload(
                state.payload.type,
                state.payload.payload,
                state.payload.parameters,
                state.payload.schema,
                state.payload.schemaVersion
            ),
        [JSON.stringify(state.payload)]
    );
    const parameters = useMemo(
        () =>
            state.payload.parameters === undefined
                ? undefined
                : (JSONBig.parse(state.payload.parameters) as SmartContractParameters),
        [state.payload.parameters]
    );

    const cost = useMemo(() => {
        if (chainParameters) {
            const energy = getEnergyCost(transactionType, payload);
            return convertEnergyToMicroCcd(energy, chainParameters);
        }
        return undefined;
    }, [transactionType, chainParameters]);

    useEffect(() => onClose(onReject), [onClose, onReject]);

    const handleSubmit = useCallback(async () => {
        if (!accountAddress) {
            throw new Error(t('errors.missingAccount'));
        }
        if (!key) {
            throw new Error(t('errors.missingKey'));
        }

        const sender = AccountAddress.fromBase58(accountAddress);
        const accountInfo = await client.getAccountInfo(sender);
        if (
            getPublicAccountAmounts(accountInfo).atDisposal <
            getTransactionAmount(transactionType, payload) + (cost?.microCcdAmount || 0n)
        ) {
            throw new Error(t('errors.insufficientFunds'));
        }

        const nonce = await client.getNextAccountNonce(sender);

        if (!nonce) {
            throw new Error(t('errors.missingNonce'));
        }

        const header = {
            expiry: getDefaultExpiry(),
            sender,
            nonce: nonce.nonce,
        };
        const transaction = { payload, header, type: transactionType };

        const hash = await sendTransaction(client, transaction, key);
        const pending = createPendingTransactionFromAccountTransaction(transaction, hash, cost?.microCcdAmount);
        await addPendingTransaction(pending);

        return hash;
    }, [payload, key, cost]);

    return (
        <Page className="send-transaction-x">
            <Page.Top heading={t('signRequest')} />
            <Page.Main>
                <Text.Main>
                    <Trans
                        ns="x"
                        i18nKey="prompts.sendTransactionX.signTransaction"
                        components={{ 1: <span className="white" /> }}
                        values={{ dApp: displayUrl(url) }}
                    />
                </Text.Main>
                <Card>
                    <Card.Row>
                        <Text.MainMedium>{getTransactionTypeName(transactionType)}</Text.MainMedium>
                    </Card.Row>
                    <Card.RowDetails title={t('payload.sender')} value={accountAddress} />
                    <DisplayTransactionPayload type={transactionType} payload={payload} />
                    <Card.RowDetails
                        title={t('payload.cost')}
                        value={cost ? displayAsCcd(cost) : t('payload.unknown')}
                    />
                    <DisplayParameters parameters={parameters} />
                </Card>
            </Page.Main>
            <Page.Footer>
                <Button.Main className="secondary" label={t('reject')} onClick={withClose(onReject)} />
                <Button.Main
                    label={t('sign')}
                    onClick={() => {
                        handleSubmit()
                            .then(withClose(onSubmit))
                            .catch((e) => addToast(e.message));
                    }}
                />
            </Page.Footer>
        </Page>
    );
}

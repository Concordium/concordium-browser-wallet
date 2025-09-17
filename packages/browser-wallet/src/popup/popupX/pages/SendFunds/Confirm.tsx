import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Cbor, CborMemo, TokenAmount, TokenId, TokenOperationType, TokenHolder } from '@concordium/web-sdk/plt';
import {
    AccountAddress,
    AccountTransactionType,
    CcdAmount,
    CIS2,
    CIS2Contract,
    Energy,
    SimpleTransferPayload,
    SimpleTransferWithMemoPayload,
    TransactionHash,
    TokenUpdatePayload,
} from '@concordium/web-sdk';
import { useAsyncMemo } from 'wallet-common-helpers';
import { useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';

import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import Arrow from '@assets/svgX/arrow-right.svg';
import Note from '@assets/svgX/note.svg';
import Card from '@popup/popupX/shared/Card';
import {
    displayNameAndSplitAddress,
    displaySplitAddress,
    useSelectedCredential,
} from '@popup/shared/utils/account-helpers';
import { AmountReceiveForm } from '@popup/popupX/shared/Form/TokenAmount/View';
import { ensureDefined } from '@shared/utils/basic-helpers';
import { CCD_METADATA } from '@shared/constants/token-metadata';
import { encodeMemo, formatCcdAmount, parseCcdAmount, parseTokenAmount } from '@popup/popupX/shared/utils/helpers';
import { useTransactionSubmit } from '@popup/shared/utils/transaction-helpers';
import Button from '@popup/popupX/shared/Button';
import { grpcClientAtom } from '@popup/store/settings';
import { logError } from '@shared/utils/log-helpers';
import { submittedTransactionRoute } from '@popup/popupX/constants/routes';

import { CIS2_TRANSFER_NRG_OFFSET, showToken, useTokenMetadata } from './util';
import {
    CIS2TransferSubmittedLocationState,
    SubmittedTransactionLocationState,
} from '../SubmittedTransaction/SubmittedTransaction';

const getTransactionType = (tokenType: string, memo?: string) => {
    if (tokenType === 'ccd') {
        if (memo) {
            return AccountTransactionType.TransferWithMemo;
        }
        return AccountTransactionType.Transfer;
    }
    if (tokenType === 'plt') {
        return AccountTransactionType.TokenUpdate;
    }
    return AccountTransactionType.Update;
};

type Props = {
    sender: AccountAddress.Type;
    values: AmountReceiveForm;
    fee: CcdAmount.Type;
};

export default function SendFundsConfirm({ values, fee, sender }: Props) {
    const { t } = useTranslation('x', { keyPrefix: 'sendFunds' });
    const credential = ensureDefined(useSelectedCredential(), 'Expected selected account to be available');
    const tokenMetadata = useTokenMetadata(values.token, sender);
    const nav = useNavigate();
    const tokenName = useMemo(() => {
        if (values.token.tokenType === 'ccd') return CCD_METADATA.name;
        if (values.token.tokenType === 'plt') return values.token.tokenSymbol;
        if (tokenMetadata === undefined || values.token.tokenType === undefined) return undefined;

        return showToken(tokenMetadata, values.token.tokenAddress);
    }, [tokenMetadata, values.token]);
    const receiver = AccountAddress.fromBase58(values.receiver);
    const transactionType = getTransactionType(values.token.tokenType, values.memo);
    const submitTransaction = useTransactionSubmit(sender, transactionType);
    const grpcClient = useAtomValue(grpcClientAtom);
    const contractClient = useAsyncMemo(
        async () => {
            if (values.token.tokenType !== 'cis2') {
                return undefined;
            }
            return CIS2Contract.create(grpcClient, values.token.tokenAddress.contract);
        },
        logError,
        [values.token, grpcClient]
    );

    const createCcdPayload = () => {
        const p: SimpleTransferPayload = {
            amount: parseCcdAmount(values.amount),
            toAddress: receiver,
        };

        if (values.memo) {
            const payloadWithMemo: SimpleTransferWithMemoPayload = {
                ...p,
                memo: encodeMemo(values.memo),
            };
            return payloadWithMemo;
        }

        return p;
    };

    const createPltPayload = () => {
        if (values.token.tokenType !== 'plt') return undefined;

        const ops = [
            {
                [TokenOperationType.Transfer]: {
                    amount: TokenAmount.fromJSON({
                        value: parseTokenAmount(values.amount, tokenMetadata?.decimals).toString(),
                        decimals: tokenMetadata?.decimals || 0,
                    }),
                    recipient: TokenHolder.fromAccountAddress(receiver),
                    memo: values.memo ? CborMemo.fromString(values.memo) : undefined,
                },
            },
        ];
        const payload: TokenUpdatePayload = {
            tokenId: TokenId.fromString(values.token.tokenSymbol),
            operations: Cbor.encode(ops),
        };

        return payload;
    };

    const payload = useAsyncMemo(
        async () => {
            if (values.token.tokenType === 'cis2') {
                if (contractClient === undefined) return undefined; // We wait for the client to be ready
                if (tokenMetadata === undefined) throw new Error('No metadata for token');

                const transfer: CIS2.Transfer = {
                    from: sender,
                    to: receiver,
                    tokenId: values.token.tokenAddress.id,
                    tokenAmount: parseTokenAmount(values.amount, tokenMetadata?.decimals),
                };
                const result = await contractClient.dryRun.transfer(sender, transfer);
                return contractClient.createTransfer(
                    { energy: Energy.create(result.usedEnergy.value + CIS2_TRANSFER_NRG_OFFSET) },
                    transfer
                ).payload;
            }
            if (values.token.tokenType === 'plt') {
                return createPltPayload();
            }
            if (values.token.tokenType === 'ccd') {
                return createCcdPayload();
            }

            return undefined;
        },
        logError,
        [values.token, sender, values.receiver, values.memo, contractClient]
    );

    const submit = async () => {
        if (payload === undefined || tokenName === undefined) {
            throw Error('Payload could not be created...');
        }

        const tx = await submitTransaction(payload, fee);
        const state: CIS2TransferSubmittedLocationState | SubmittedTransactionLocationState =
            values.token.tokenType === 'ccd'
                ? { transactionType, payload, fee }
                : {
                      updateType: 'cis2.transfer',
                      amount: values.amount,
                      tokenName,
                      transactionType: AccountTransactionType.Update,
                  };
        nav(submittedTransactionRoute(TransactionHash.fromHexString(tx)), {
            state,
        });
    };

    return (
        <Page className="send-funds-container">
            <Page.Top heading={t('confirmation.title')} />

            <Card className="send-funds-confirm__card" type="transparent">
                <div className="send-funds-confirm__card_destination">
                    <Text.MainMedium>{displayNameAndSplitAddress(credential)}</Text.MainMedium>
                    <Arrow />
                    <Text.MainMedium>{displaySplitAddress(values.receiver)}</Text.MainMedium>
                </div>
                <Text.Capture>
                    {t('amount')} ({tokenName}
                    ):
                </Text.Capture>
                <Text.HeadingLarge>{values.amount}</Text.HeadingLarge>
                <Text.Capture>{t('estimatedFee', { fee: formatCcdAmount(fee) })}</Text.Capture>
                {values.memo && (
                    <div className="send-funds-confirm__card_memo">
                        <Note />
                        <Text.MainMedium>{values.memo}</Text.MainMedium>
                    </div>
                )}
            </Card>

            <Page.Footer>
                <Button.Main
                    className="button-main"
                    onClick={submit}
                    label={t('sendFunds')}
                    disabled={payload === undefined}
                />
            </Page.Footer>
        </Page>
    );
}

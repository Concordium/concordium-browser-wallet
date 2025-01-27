import React, { useState } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    AccountAddress,
    AccountTransactionType,
    CIS2,
    CIS2Contract,
    CcdAmount,
    Energy,
    SimpleTransferPayload,
} from '@concordium/web-sdk';
import { useAsyncMemo } from 'wallet-common-helpers';
import { useAtomValue } from 'jotai';

import Button from '@popup/popupX/shared/Button';
import { displayNameAndSplitAddress, useCredential } from '@popup/shared/utils/account-helpers';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import TokenAmount, { AmountReceiveForm } from '@popup/popupX/shared/Form/TokenAmount';
import Form, { useForm } from '@popup/popupX/shared/Form';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext';
import { useGetTransactionFee } from '@popup/shared/utils/transaction-helpers';
import { TokenPickerVariant } from '@popup/popupX/shared/Form/TokenAmount/View';
import { parseTokenAmount } from '@popup/popupX/shared/utils/helpers';
import { grpcClientAtom } from '@popup/store/settings';
import { logError } from '@shared/utils/log-helpers';
import FullscreenNotice from '@popup/popupX/shared/FullscreenNotice';
import SendFundsConfirm from './Confirm';
import { CIS2_TRANSFER_NRG_OFFSET, useTokenMetadata } from './util';

type SendFundsProps = { address: AccountAddress.Type };
export type SendFundsLocationState = TokenPickerVariant;

function SendFunds({ address }: SendFundsProps) {
    const { t } = useTranslation('x', { keyPrefix: 'sendFunds' });
    const { state } = useLocation() as { state: SendFundsLocationState | null };
    const credential = useCredential(address.address);
    const grpcClient = useAtomValue(grpcClientAtom);
    const form = useForm<AmountReceiveForm>({
        mode: 'all',
        defaultValues: {
            token: state ?? { tokenType: 'ccd' },
            amount: '0.00',
        },
    });
    const accountInfo = useAccountInfo(credential);
    const [token, amount] = form.watch(['token', 'amount']);
    const contractClient = useAsyncMemo(
        async () => {
            if (token?.tokenType !== 'cis2') {
                return undefined;
            }
            return CIS2Contract.create(grpcClient, token.tokenAddress.contract);
        },
        logError,
        [token, grpcClient]
    );

    const getFee = useGetTransactionFee();
    const metadata = useTokenMetadata(token, address);
    const fee = useAsyncMemo(
        async () => {
            if (token?.tokenType === 'cis2') {
                if (contractClient === undefined || metadata === undefined) {
                    return undefined;
                }

                let tokenAmount: bigint;
                try {
                    tokenAmount = parseTokenAmount(amount, metadata.decimals);
                } catch {
                    return undefined;
                }

                const transfer: CIS2.Transfer = {
                    from: address,
                    to: address,
                    tokenId: token.tokenAddress.id,
                    tokenAmount,
                };
                const result = await contractClient.dryRun.transfer(address, transfer);
                const { payload } = contractClient.createTransfer(
                    { energy: Energy.create(result.usedEnergy.value + CIS2_TRANSFER_NRG_OFFSET) },
                    transfer
                );
                return getFee(AccountTransactionType.Update, payload);
            }
            if (token?.tokenType === 'ccd') {
                const payload: SimpleTransferPayload = {
                    amount: CcdAmount.zero(),
                    toAddress: AccountAddress.fromBuffer(new Uint8Array(32)),
                };
                return getFee(AccountTransactionType.Transfer, payload);
            }

            return undefined;
        },
        logError,
        [token, address, amount, contractClient]
    );

    const [showConfirmationPage, setShowConfirmationPage] = useState(false);
    const onSubmit = () => setShowConfirmationPage(true);

    if (accountInfo === undefined) {
        return null;
    }

    return (
        <>
            <FullscreenNotice open={showConfirmationPage} onClose={() => setShowConfirmationPage(false)}>
                {fee && <SendFundsConfirm sender={address} values={form.getValues()} fee={fee} />}
            </FullscreenNotice>
            <Page className="send-funds-container">
                <Page.Top heading={t('sendFunds')}>
                    <Text.Capture className="m-l-5 m-t-neg-5">
                        {t('from', { name: displayNameAndSplitAddress(credential) })}
                    </Text.Capture>
                </Page.Top>
                <Form formMethods={form} onSubmit={onSubmit}>
                    {() => (
                        <TokenAmount
                            buttonMaxLabel={t('sendMax')}
                            receiver
                            fee={fee ?? CcdAmount.zero()}
                            form={form}
                            accountInfo={accountInfo}
                            {...state}
                        />
                    )}
                </Form>
                {/*
                <div className="send-funds__memo">
                    <Plus />
                    <span className="label__main">Add memo</span>
                </div>
            */}
                <Page.Footer>
                    <Button.Main className="button-main" onClick={form.handleSubmit(onSubmit)} label="Continue" />
                </Page.Footer>
            </Page>
        </>
    );
}

export default function Loader() {
    const params = useParams();
    if (params.account === undefined) {
        // No account address passed in the url.
        return <Navigate to="../" />;
    }
    return <SendFunds address={AccountAddress.fromBase58(params.account)} />;
}

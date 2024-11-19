import React, { useState } from 'react';
import Button from '@popup/popupX/shared/Button';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { displayNameAndSplitAddress, displaySplitAddress, useCredential } from '@popup/shared/utils/account-helpers';
import { useTranslation } from 'react-i18next';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import TokenAmount, { AmountReceiveForm } from '@popup/popupX/shared/Form/TokenAmount';
import Form, { useForm } from '@popup/popupX/shared/Form';
import {
    AccountAddress,
    AccountTransactionType,
    CIS2,
    CIS2Contract,
    CcdAmount,
    SimpleTransferPayload,
    TransactionHash,
} from '@concordium/web-sdk';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext';
import { useGetTransactionFee } from '@popup/shared/utils/transaction-helpers';
import FullscreenNotice from '@popup/popupX/shared/FullscreenNotice';
import Arrow from '@assets/svgX/arrow-right.svg';
import { submittedTransactionRoute } from '@popup/popupX/constants/routes';
import { TokenPickerVariant } from '@popup/popupX/shared/Form/TokenAmount/View';
import { parseTokenAmount } from '@popup/popupX/shared/utils/helpers';
import { noOp, useAsyncMemo } from 'wallet-common-helpers';
import { useAtomValue } from 'jotai';
import { grpcClientAtom } from '@popup/store/settings';
import { logError } from '@shared/utils/log-helpers';

type SendFundsProps = { address: AccountAddress.Type };
export type SendFundsLocationState = TokenPickerVariant;

function SendFunds({ address }: SendFundsProps) {
    const { t } = useTranslation('x', { keyPrefix: 'sendFunds' });
    const { state } = useLocation() as { state: SendFundsLocationState | null };
    const nav = useNavigate();
    const credential = useCredential(address.address);
    const grpcClient = useAtomValue(grpcClientAtom);
    const form = useForm<AmountReceiveForm>({
        mode: 'onTouched',
        defaultValues: {
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
        noOp,
        [token, grpcClient]
    );
    const getFee = useGetTransactionFee();
    const cost = useAsyncMemo(
        async () => {
            if (token?.tokenType === 'cis2') {
                if (contractClient === undefined) {
                    return undefined;
                }

                const transfer: CIS2.Transfer = {
                    from: address,
                    to: address,
                    tokenId: token.tokenAddress.id,
                    tokenAmount: parseTokenAmount(amount),
                };
                const result = await contractClient.dryRun.transfer(address, transfer);
                const { payload } = contractClient.createTransfer({ energy: result.usedEnergy }, transfer);
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

    // TODO:
    // 1. Submit transaction (see `Delegator/TransactionFlow`)
    // 2. Pass the transaction hash to the route function below
    const navToSubmitted = () => nav(submittedTransactionRoute(TransactionHash.fromHexString('..')));

    const receiver: string | undefined = form.watch('receiver');

    if (accountInfo === undefined) {
        return null;
    }

    return (
        <>
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
                            fee={cost ?? CcdAmount.zero()}
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
            {/* Confirmation page modal */}
            <FullscreenNotice open={showConfirmationPage} onClose={() => setShowConfirmationPage(false)}>
                <Page className="send-funds-container">
                    <Page.Top heading="Confirmation" />

                    <div className="send-funds-confirm__card">
                        <div className="send-funds-confirm__card_destination">
                            <Text.MainMedium>{displayNameAndSplitAddress(credential)}</Text.MainMedium>
                            <Arrow />
                            <Text.MainMedium>{receiver && displaySplitAddress(receiver)}</Text.MainMedium>
                        </div>
                        <Text.Capture>
                            {t('amount')} ({}):
                        </Text.Capture>
                        <Text.HeadingLarge>{form.watch('amount')}</Text.HeadingLarge>
                        <Text.Capture>{t('estimatedFee', { fee: cost })}</Text.Capture>
                    </div>

                    <Page.Footer>
                        <Button.Main className="button-main" onClick={navToSubmitted} label={t('sendFunds')} />
                    </Page.Footer>
                </Page>
            </FullscreenNotice>
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

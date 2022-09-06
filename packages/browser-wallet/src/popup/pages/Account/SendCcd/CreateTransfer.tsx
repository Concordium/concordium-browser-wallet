import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { selectedAccountAtom } from '@popup/store/account';
import Form from '@popup/shared/Form';
import CcdInput from '@popup/shared/Form/CcdInput';
import Input from '@popup/shared/Form/Input';
import { ccdToMicroCcd, getPublicAccountAmounts, microCcdToCcd } from 'wallet-common-helpers';
import { SimpleTransferPayload } from '@concordium/web-sdk';
import { SubmitHandler, useForm, Validate } from 'react-hook-form';
import Submit from '@popup/shared/Form/Submit';
import {
    buildSimpleTransferPayload,
    validateTransferAmount,
    validateAccountAddress,
} from '@popup/shared/utils/transaction-helpers';
import { useLocation, useNavigate } from 'react-router-dom';
import DisplayCost from '@popup/shared/TransactionReceipt/DisplayCost';
import { useAccountInfo } from '@popup/shared/AccountInfoEmitterContext';
import { useSelectedCredential } from '@popup/shared/utils/account-helpers';
import { routes } from './routes';

export type FormValues = {
    ccd: string;
    recipient: string;
};

interface Props {
    cost?: bigint;
}

interface State {
    payload: SimpleTransferPayload | undefined;
}

export default function CreateTransaction({ cost = 0n }: Props) {
    const { t } = useTranslation('account');
    const { t: tShared } = useTranslation('shared');
    const { state } = useLocation();
    const defaultPayload = (state as State)?.payload;
    const address = useAtomValue(selectedAccountAtom);
    const selectedCred = useSelectedCredential();
    const nav = useNavigate();
    const form = useForm<FormValues>({
        defaultValues: {
            ccd: microCcdToCcd(defaultPayload?.amount.microGtuAmount),
            recipient: defaultPayload?.toAddress.address,
        },
    });

    if (!address || !selectedCred) {
        return null;
    }

    const accountInfo = useAccountInfo(selectedCred);
    const validateAmount: Validate<string> = (amount) => validateTransferAmount(amount, accountInfo, cost);
    const maxValue = getPublicAccountAmounts(accountInfo).atDisposal - cost;

    const onSubmit: SubmitHandler<FormValues> = (vs) => {
        const payload = buildSimpleTransferPayload(vs.recipient, ccdToMicroCcd(vs.ccd));
        nav(routes.confirm, { state: { payload } });
    };

    return (
        <Form
            formMethods={form}
            className="flex-column justify-space-between align-center h-full w-full"
            onSubmit={onSubmit}
        >
            {(f) => (
                <>
                    <p className="m-v-10 text-center">{t('sendCcd.title')}</p>
                    <CcdInput
                        register={f.register}
                        name="ccd"
                        label={t('sendCcd.labels.ccd')}
                        className="send-ccd__create-transfer__input"
                        onMax={() => form.setValue('ccd', microCcdToCcd(maxValue) || '0')}
                        rules={{
                            required: tShared('utils.ccdAmount.required'),
                            validate: validateAmount,
                        }}
                    />
                    <Input
                        register={f.register}
                        name="recipient"
                        label={t('sendCcd.labels.recipient')}
                        className="send-ccd__create-transfer__input"
                        rules={{
                            required: tShared('utils.address.required'),
                            validate: validateAccountAddress,
                        }}
                    />
                    <DisplayCost cost={cost} />
                    <Submit className="send-ccd__create-transfer__button" width="medium">
                        {t('sendCcd.buttons.continue')}
                    </Submit>
                </>
            )}
        </Form>
    );
}

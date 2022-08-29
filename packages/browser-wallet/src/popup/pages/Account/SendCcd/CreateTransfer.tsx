import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { selectedAccountAtom } from '@popup/store/account';
import Form from '@popup/shared/Form';
import Input from '@popup/shared/Form/Input';
import { ccdToMicroCcd, displayAsCcd, microCcdToCcd } from 'wallet-common-helpers';
import { SimpleTransferPayload } from '@concordium/web-sdk';
import { SubmitHandler, Validate } from 'react-hook-form';
import Submit from '@popup/shared/Form/Submit';
import {
    buildSimpleTransferPayload,
    validateTransferAmount,
    validateAccountAddress,
} from '@popup/shared/utils/transaction-helpers';
import { useNavigate } from 'react-router-dom';
import { routes } from './routes';
import { accountContext, AccountContextValues } from '../AccountContext';

export type FormValues = {
    ccd: string;
    recipient: string;
};

interface Props {
    setPayload: (payload: SimpleTransferPayload) => void;
    defaultPayload?: SimpleTransferPayload | undefined;
}

export default function CreateTransaction({ setPayload, defaultPayload }: Props) {
    const { t } = useTranslation('account');
    const { t: tShared } = useTranslation('shared');
    const address = useAtomValue(selectedAccountAtom);
    const nav = useNavigate();
    const { accountInfo } = useContext<AccountContextValues>(accountContext);
    // TODO: fix this;
    const fee = 1n;

    const validateAmount: Validate<string> = (amount) => validateTransferAmount(amount, accountInfo, fee);

    if (!address) {
        return null;
    }

    const onSubmit: SubmitHandler<FormValues> = async (vs) => {
        setPayload(buildSimpleTransferPayload(vs.recipient, ccdToMicroCcd(vs.ccd)));
        nav(`../${routes.confirm}`);
    };

    return (
        <div>
            <p className="m-t-10 m-b-20 text-center">{t('sendCcd.title')}</p>
            <Form
                className="flex-column justify-space-between align-center"
                onSubmit={onSubmit}
                defaultValues={{
                    ccd: microCcdToCcd(defaultPayload?.amount.microGtuAmount),
                    recipient: defaultPayload?.toAddress.address,
                }}
            >
                {(f) => (
                    <>
                        <Input
                            register={f.register}
                            name="ccd"
                            label={t('sendCcd.labels.ccd')}
                            className="m-b-20 w-full"
                            rules={{
                                required: tShared('utils.ccdAmount.required'),
                                validate: validateAmount,
                            }}
                        />
                        <Input
                            register={f.register}
                            name="recipient"
                            label={t('sendCcd.labels.recipient')}
                            className="m-b-20 w-full"
                            rules={{
                                required: tShared('utils.address.required'),
                                validate: validateAccountAddress,
                            }}
                        />
                        <p>
                            {t('sendCcd.fee')} {displayAsCcd(1n)}
                        </p>
                        <Submit className="m-t-10" width="narrow">
                            {t('sendCcd.buttons.continue')}
                        </Submit>
                    </>
                )}
            </Form>
        </div>
    );
}

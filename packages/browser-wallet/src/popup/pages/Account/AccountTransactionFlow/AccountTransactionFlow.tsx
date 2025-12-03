import React, { useCallback, useState } from 'react';

import BackButton from '@popup/shared/BackButton';
import MultiStepForm, { FormChildren, MultiStepFormProps, OrRenderValues } from '@popup/shared/MultiStepForm';
import { AccountTransactionInput, AccountTransactionType } from '@concordium/web-sdk';
import { useLocation, useNavigate } from 'react-router-dom';
import { absoluteRoutes } from '@popup/constants/routes';
import { noOp } from 'wallet-common-helpers';
import { accountRoutes } from '../routes';
import { ConfirmGenericTransferState } from '../ConfirmGenericTransfer';

interface Props<F extends Record<string, unknown>>
    extends Omit<MultiStepFormProps<F>, 'onDone' | 'initialValues' | 'valueStore'> {
    /**
     * Flow title. Can be overridden for each page.
     */
    title: string;
    /**
     * Function to convert flow values into an account transaction.
     */
    convert(values: F): AccountTransactionInput;
    /**
     * Function that is triggered if an error is thrown in the done handler.
     */
    handleDoneError?: (error: Error) => void;
    /**
     * Whether to include a back button on the first page or not.
     */
    firstPageBack?: boolean;
    /**
     * Pages of the transaction flow declared as a mapping of components to corresponding substate.
     * Declaration order defines the order the pages are shown.
     */
    children: OrRenderValues<F, FormChildren<F>>;
    transactionType: AccountTransactionType;
}

export default function AccountTransactionFlow<F extends Record<string, unknown>>({
    title,
    firstPageBack = false,
    convert,
    children,
    transactionType,
    handleDoneError = noOp,
}: Props<F>) {
    const { state: initialValues, pathname } = useLocation();
    const [isFirstPage, setIsFirstPage] = useState(true);
    const nav = useNavigate();

    const handlePageActive = (step: keyof F, values: F) => {
        const flowChildren = typeof children === 'function' ? children(values) : children;
        const isFirst = Object.keys(flowChildren).indexOf(step as string) === 0;

        setIsFirstPage(isFirst);
    };

    const handleDone = useCallback(
        (values: F) => {
            let payload: AccountTransactionInput;
            try {
                payload = convert(values);
                nav(pathname, { replace: true, state: values }); // Override current router entry with stateful version

                const confirmTransferState: ConfirmGenericTransferState = {
                    payload,
                    type: transactionType,
                };
                nav(`${absoluteRoutes.home.account.path}/${accountRoutes.confirmTransfer}`, {
                    state: confirmTransferState,
                });
            } catch (e) {
                handleDoneError(e as Error);
            }
        },
        [pathname]
    );
    return (
        <div className="account-transaction-flow">
            <header className="account-transaction-flow__header">
                {(!isFirstPage || firstPageBack) && <BackButton className="account-transaction-flow__back" />}
                <h3 className="m-0">{title}</h3>
            </header>
            <MultiStepForm<F>
                initialValues={initialValues as F | undefined}
                onDone={handleDone}
                onPageActive={handlePageActive}
            >
                {children}
            </MultiStepForm>
        </div>
    );
}

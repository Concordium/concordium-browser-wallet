import React, { useState } from 'react';

import BackButton from '@popup/shared/BackButton';
import MultiStepForm, { FormChildren, MultiStepFormProps, OrRenderValues } from '@popup/shared/MultiStepForm';
import { AccountTransactionPayload } from '@concordium/web-sdk';

interface Props<F extends Record<string, unknown>>
    extends Omit<MultiStepFormProps<F>, 'onDone' | 'initialValues' | 'valueStore'> {
    /**
     * Flow title. Can be overridden for each page.
     */
    title: string;
    /**
     * Function to convert flow values into an account transaction.
     */
    convert(values: F): AccountTransactionPayload;
    /**
     * Whether to include a back button on the first page or not.
     */
    firstPageBack?: boolean;
    /**
     * Pages of the transaction flow declared as a mapping of components to corresponding substate.
     * Declaration order defines the order the pages are shown.
     */
    children: OrRenderValues<F, FormChildren<F>>;
}

export default function AccountTransactionFlow<F extends Record<string, unknown>>({
    title,
    firstPageBack = false,
    convert,
    children,
}: Props<F>) {
    const [isFirstPage, setIsFirstPage] = useState(true);

    const handlePageActive = (step: keyof F, values: F) => {
        const flowChildren = typeof children === 'function' ? children(values) : children;
        const isFirst = Object.keys(flowChildren).indexOf(step as string) === 0;

        setIsFirstPage(isFirst);
    };

    const handleDone = (values: F) => {
        const payload = convert(values);
        // eslint-disable-next-line no-console
        console.log(values, payload);
    };
    return (
        <div className="account-transaction-flow">
            <header className="account-transaction-flow__header">
                {(!isFirstPage || firstPageBack) && <BackButton className="account-transaction-flow__back" />}
                <h3 className="m-0">{title}</h3>
            </header>
            {/* eslint-disable-next-line no-console */}
            <MultiStepForm<F> onDone={handleDone} onPageActive={handlePageActive}>
                {children}
            </MultiStepForm>
        </div>
    );
}

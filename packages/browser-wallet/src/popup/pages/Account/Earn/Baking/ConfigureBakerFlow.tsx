import React, { useCallback } from 'react';
import { AccountTransactionType } from '@concordium/web-sdk';

import { ensureDefined } from '@shared/utils/basic-helpers';
import { useSelectedAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import { configureBakerChangesPayload, ConfigureBakerFlowState } from './utils';
import AccountTransactionFlow from '../../AccountTransactionFlow';
import RestakePage from './FlowPages/Restake';
import AmountPage from './FlowPages/Amount';
import OpenForDelegationPage from './FlowPages/OpenForDelegation';
import CommissionsPage from './FlowPages/Commissions';
import { MetadataUrlPage } from './FlowPages/MetadataUrl';
import KeysPage from './FlowPages/Keys';

type Props = {
    title: string;
    onConvertError?: (e: Error) => void;
};

export function ConfigureBakerFull({ onConvertError, ...props }: Props) {
    const accountInfo = ensureDefined(useSelectedAccountInfo(), 'Assumed account info to be available');
    const valuesToPayload = useCallback(configureBakerChangesPayload(accountInfo), [accountInfo]);

    return (
        <AccountTransactionFlow<ConfigureBakerFlowState>
            {...props}
            firstPageBack
            convert={valuesToPayload}
            transactionType={AccountTransactionType.ConfigureBaker}
            handleDoneError={onConvertError}
        >
            {{
                restake: {
                    render: (initial, onNext, formValues) => (
                        <RestakePage initial={initial} onNext={onNext} formValues={formValues} />
                    ),
                },
                amount: {
                    render: (initial, onNext, formValues) => (
                        <AmountPage
                            initial={initial}
                            onNext={onNext}
                            formValues={formValues}
                            accountInfo={accountInfo}
                        />
                    ),
                },
                openForDelegation: {
                    render: (initial, onNext, formValues) => (
                        <OpenForDelegationPage
                            initial={initial}
                            onNext={onNext}
                            accountInfo={accountInfo}
                            formValues={formValues}
                        />
                    ),
                },
                commissionRates: {
                    render: (initial, onNext, formValues) => (
                        <CommissionsPage initial={initial} onNext={onNext} formValues={formValues} />
                    ),
                },
                metadataUrl: {
                    render: (initial, onNext, formValues) => (
                        <MetadataUrlPage initial={initial} onNext={onNext} formValues={formValues} />
                    ),
                },
                keys: {
                    render: (initial, onNext, formValues) => (
                        <KeysPage initial={initial} onNext={onNext} accountInfo={accountInfo} formValues={formValues} />
                    ),
                },
            }}
        </AccountTransactionFlow>
    );
}

export function ConfigureBakerStake({ onConvertError, ...props }: Props) {
    const accountInfo = ensureDefined(useSelectedAccountInfo(), 'Assumed account info to be available');
    const valuesToPayload = useCallback(configureBakerChangesPayload(accountInfo), [accountInfo]);

    return (
        <AccountTransactionFlow<ConfigureBakerFlowState>
            {...props}
            firstPageBack
            convert={valuesToPayload}
            transactionType={AccountTransactionType.ConfigureBaker}
            handleDoneError={onConvertError}
        >
            {{
                restake: {
                    render: (initial, onNext, formValues) => (
                        <RestakePage initial={initial} onNext={onNext} formValues={formValues} />
                    ),
                },
                amount: {
                    render: (initial, onNext, formValues) => (
                        <AmountPage
                            initial={initial}
                            onNext={onNext}
                            formValues={formValues}
                            accountInfo={accountInfo}
                        />
                    ),
                },
            }}
        </AccountTransactionFlow>
    );
}

export function ConfigureBakerPool({ onConvertError, ...props }: Props) {
    const accountInfo = ensureDefined(useSelectedAccountInfo(), 'Assumed account info to be available');
    const valuesToPayload = useCallback(configureBakerChangesPayload(accountInfo), [accountInfo]);

    return (
        <AccountTransactionFlow<ConfigureBakerFlowState>
            {...props}
            convert={valuesToPayload}
            firstPageBack
            transactionType={AccountTransactionType.ConfigureBaker}
            handleDoneError={onConvertError}
        >
            {{
                openForDelegation: {
                    render: (initial, onNext, formValues) => (
                        <OpenForDelegationPage
                            initial={initial}
                            onNext={onNext}
                            accountInfo={accountInfo}
                            formValues={formValues}
                        />
                    ),
                },
                commissionRates: {
                    render: (initial, onNext, formValues) => (
                        <CommissionsPage initial={initial} onNext={onNext} formValues={formValues} />
                    ),
                },
                metadataUrl: {
                    render: (initial, onNext, formValues) => (
                        <MetadataUrlPage initial={initial} onNext={onNext} formValues={formValues} />
                    ),
                },
            }}
        </AccountTransactionFlow>
    );
}

export function ConfigureBakerKeys({ onConvertError, ...props }: Props) {
    const accountInfo = ensureDefined(useSelectedAccountInfo(), 'Assumed account info to be available');
    const valuesToPayload = useCallback(configureBakerChangesPayload(accountInfo), [accountInfo]);

    return (
        <AccountTransactionFlow<ConfigureBakerFlowState>
            {...props}
            firstPageBack
            convert={valuesToPayload}
            transactionType={AccountTransactionType.ConfigureBaker}
            handleDoneError={onConvertError}
        >
            {{
                keys: {
                    render: (initial, onNext, formValues) => (
                        <KeysPage initial={initial} onNext={onNext} accountInfo={accountInfo} formValues={formValues} />
                    ),
                },
            }}
        </AccountTransactionFlow>
    );
}

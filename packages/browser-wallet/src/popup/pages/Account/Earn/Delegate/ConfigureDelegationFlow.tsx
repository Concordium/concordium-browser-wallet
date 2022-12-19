import React, { useCallback } from 'react';
import { AccountTransactionType } from '@concordium/web-sdk';

import Button from '@popup/shared/Button';
import { ensureDefined } from '@shared/utils/basic-helpers';
import { useSelectedAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';

import AccountTransactionFlow from '../../AccountTransactionFlow';
import { configureDelegationChangesPayload, ConfigureDelegationFlowState } from './utils';

type Props = {
    title: string;
    firstPageBack?: boolean;
};

export default function ConfigureDelegationFlow(props: Props) {
    const accountInfo = ensureDefined(useSelectedAccountInfo(), 'Assumed account info to be available');
    const valuesToPayload = useCallback(configureDelegationChangesPayload(accountInfo), [accountInfo]);

    return (
        <AccountTransactionFlow<ConfigureDelegationFlowState>
            {...props}
            convert={valuesToPayload}
            transactionType={AccountTransactionType.ConfigureDelegation}
        >
            {{
                pool: {
                    render: (_, onNext) => (
                        <div>
                            Pool
                            <br />
                            <Button onClick={() => onNext(null)}>Next</Button>
                        </div>
                    ),
                },
                settings: {
                    render: (_, onNext) => (
                        <div>
                            Settings
                            <br />
                            <Button onClick={() => onNext({ amount: '1', redelegate: true })}>Next</Button>
                        </div>
                    ),
                },
            }}
        </AccountTransactionFlow>
    );
}

import React from 'react';
import { ConfigureDelegationPayload, DelegationTargetType } from '@concordium/web-sdk';
import { Navigate, useLocation, Location } from 'react-router-dom';
import { useAtomValue } from 'jotai';

import { selectedAccountAtom } from '@popup/store/account';
import Button from '@popup/popupX/shared/Button';
import Page from '@popup/popupX/shared/Page';
import { formatCcdAmount } from '@popup/popupX/shared/utils/helpers';
import Card from '@popup/popupX/shared/Card';
import { ensureDefined } from '@shared/utils/basic-helpers';

import { useGetConfigureDelegationCost } from '../util';

export type DelegationResultLocationState = {
    payload: ConfigureDelegationPayload;
    type: 'register' | 'change' | 'remove';
};

export default function DelegationResult() {
    const { state } = useLocation() as Location & {
        state: DelegationResultLocationState | undefined;
    };
    const getCost = useGetConfigureDelegationCost();
    const account = ensureDefined(useAtomValue(selectedAccountAtom), 'No account selected');

    if (state === undefined) {
        return <Navigate to=".." />;
    }

    const fee = getCost(state.payload);

    // FIXME: translations...
    return (
        <Page className="delegation-result-container">
            <Page.Top heading="Register delegation" />
            <span className="capture__main_small">
                This will lock your delegation amount. Amount is released after 14 days from the time you remove or
                decrease your delegation.
            </span>
            <Card className="delegation-result__card">
                <Card.Row>
                    <Card.RowDetails title="Sender" value={account} />
                </Card.Row>
                {state.payload.delegationTarget !== undefined && (
                    <Card.Row>
                        <Card.RowDetails
                            title="Target"
                            value={
                                state.payload.delegationTarget.delegateType === DelegationTargetType.Baker
                                    ? `Validator ${state.payload.delegationTarget.bakerId}`
                                    : 'Passive delegation'
                            }
                        />
                    </Card.Row>
                )}
                {state.payload.stake !== undefined && (
                    <Card.Row>
                        <Card.RowDetails
                            title="Delegation amount"
                            value={`${formatCcdAmount(state.payload.stake)} CCD`}
                        />
                    </Card.Row>
                )}
                {state.payload.restakeEarnings !== undefined && (
                    <Card.Row>
                        <Card.RowDetails
                            title="Rewards will be"
                            value={
                                state.payload.restakeEarnings ? 'Added to delegation amount' : 'Added to public balance'
                            }
                        />
                    </Card.Row>
                )}
                <Card.Row>
                    <Card.RowDetails
                        title="Estimated transaction fee"
                        value={`${fee !== undefined ? formatCcdAmount(fee) : '...'} CCD`}
                    />
                </Card.Row>
            </Card>
            <Page.Footer>
                <Button.Main label="Submit delegation" className="m-t-20" />
            </Page.Footer>
        </Page>
    );
}

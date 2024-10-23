import React from 'react';
import { ConfigureDelegationPayload } from '@concordium/web-sdk';
import { Navigate, useLocation, Location } from 'react-router-dom';

import Button from '@popup/popupX/shared/Button';
import Page from '@popup/popupX/shared/Page';
import { formatCcdAmount } from '@popup/popupX/shared/utils/helpers';
import { useGetConfigureDelegationCost } from '../util';

export default function DelegationResult() {
    const { state } = useLocation() as Location & {
        state: ConfigureDelegationPayload | undefined;
    };
    const getCost = useGetConfigureDelegationCost();

    if (state === undefined) {
        return <Navigate to=".." />;
    }

    const fee = getCost(state);

    // FIXME: translations...
    return (
        <Page className="delegation-result-container">
            <Page.Top heading="Register delegation" />
            <span className="capture__main_small">
                This will lock your delegation amount. Amount is released after 14 days from the time you remove or
                decrease your delegation.
            </span>
            <div className="delegation-result__card">
                <div className="delegation-result__card_row">
                    <span className="capture__main_small">Transaction</span>
                    <span className="capture__main_small">Register delegation</span>
                </div>
                <div className="delegation-result__card_row">
                    <span className="capture__main_small">Estimated transaction fee</span>
                    <span className="capture__main_small">{fee !== undefined ? formatCcdAmount(fee) : '...'} CCD</span>
                </div>
                <div className="delegation-result__card_row">
                    <span className="capture__main_small">Transaction hash</span>
                    <span className="capture__main_small">
                        4f84fg3gb6d9s9s3s1d46gg9grf7jmf9xc5c7s5x3vn80b8c6x5x4f84fg3gb6d9s9s3s1d4
                    </span>
                </div>
            </div>
            <Page.Footer>
                <Button.Main label="Submit delegation" />
            </Page.Footer>
        </Page>
    );
}

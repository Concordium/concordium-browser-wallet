import React from 'react';
import CheckCircle from '@assets/svgX/circled-check-done.svg';
import ErrorCircle from '@assets/svgX/circled-x-block-deny.svg';
import Text from '@popup/popupX/shared/Text';

export function LedgerConnectionSuccess() {
    return (
        <div className="ledger-toast success">
            <CheckCircle />
            <span className="ledger-toast__text">
                <Text.Label>Connection Successful</Text.Label>
            </span>
        </div>
    );
}

export function LedgerConnectionFailed() {
    return (
        <div className="ledger-toast error">
            <ErrorCircle />
            <span className="ledger-toast__text">
                <Text.Label>Connection Failed</Text.Label>
            </span>
        </div>
    );
}

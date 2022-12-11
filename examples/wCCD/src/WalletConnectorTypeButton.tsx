/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { destroy } from './wallet/WalletConnection';
import { WalletConnectionProps } from './wallet/WithWalletConnection';

function connectorTypeStyle(baseStyle: any, selected: boolean) {
    const style = { ...baseStyle, width: '50%' };
    if (selected) {
        style.backgroundColor = '#174039';
        style.border = '1px solid #0c221f';
    }
    return style;
}

interface Props extends WalletConnectionProps {
    buttonStyle: any;
    disabledButtonStyle: any;
    connectorType: string;
    connectorName: string;
    setWaitingForUser: (v: boolean) => void;
}

export function WalletConnectionTypeButton(props: Props) {
    const {
        buttonStyle,
        disabledButtonStyle,
        connectorType,
        connectorName,
        activeConnectorType,
        activeConnector,
        activeConnection,
        setActiveConnectorType,
        setWaitingForUser,
    } = props;
    const isAlreadyConnected = Boolean(activeConnectorType === connectorType && activeConnection);
    const disabled = Boolean(activeConnectorType && activeConnectorType !== connectorType && activeConnection);
    return (
        <button
            style={connectorTypeStyle(
                disabled ? disabledButtonStyle : buttonStyle,
                activeConnectorType === connectorType
            )}
            disabled={disabled}
            type="button"
            onClick={() => {
                setWaitingForUser(false);
                if (activeConnector) {
                    destroy(activeConnector).catch(console.error);
                }
                if (activeConnectorType === connectorType) {
                    setActiveConnectorType(undefined);
                } else {
                    setActiveConnectorType(connectorType);
                }
            }}
        >
            {isAlreadyConnected ? 'Disconnect' : `Use ${connectorName}`}
        </button>
    );
}

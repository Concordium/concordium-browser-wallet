/* eslint-disable no-console */
/* eslint-disable react/sort-comp */

import React from 'react';
import { SignClientTypes } from '@walletconnect/types';
import { ConnectionDelegate, destroy, Network, WalletConnection, WalletConnector } from './WalletConnection';
import { BrowserWalletConnector } from './BrowserWallet';
import { WalletConnectConnector } from './WalletConnect';

interface State {
    connectorType: ConnectorType | undefined;
    connector: WalletConnector | undefined;
    activeConnection: WalletConnection | undefined;
    connectedAccount: string | undefined;
}

interface ChildrenProps extends State {
    setConnectorType: (t: ConnectorType | undefined) => void;
}

interface Props {
    network: Network;
    walletConnectOpts: SignClientTypes.Options;
    children: (props: ChildrenProps) => React.ReactNode;
}

type ConnectorType = 'BrowserWallet' | 'WalletConnect';

// eslint-disable-next-line react/prefer-stateless-function
export class WithWalletConnection extends React.Component<Props, State> implements ConnectionDelegate {
    constructor(props: Props) {
        super(props);
        this.state = {
            connectorType: undefined,
            connector: undefined,
            activeConnection: undefined,
            connectedAccount: undefined,
        };
    }

    setConnectorType(type: ConnectorType | undefined) {
        const { network } = this.props;
        const { connectorType, connector } = this.state;
        if (type !== connectorType) {
            if (connector) {
                destroy(connector).catch(console.error);
            }
            this.createConnector(connectorType, network).then(
                (c) => this.setState((state) => ({ ...state, connector: c })),
                console.error
            );
        }
    }

    private createConnector(connectorType: string | undefined, network: Network): Promise<WalletConnector> {
        const { walletConnectOpts } = this.props;
        switch (connectorType) {
            case 'BrowserWallet':
                return BrowserWalletConnector.create(this);
            case 'WalletConnect':
                return WalletConnectConnector.create(walletConnectOpts, network, this);
            default:
                throw new Error(`invalid connector type '${connectorType}'`);
        }
    }

    onAccountChanged(connection: WalletConnection, address: string | undefined) {
        const { activeConnection } = this.state;
        console.log('account changed', { connection, address, activeConnection });
        if (connection === activeConnection) {
            console.log('setting account');
            this.setState((state) => ({ ...state, connectedAccount: address }));
        }
    }

    onChainChanged(connection: WalletConnection, genesisHash: string) {
        const { network } = this.props;
        // Check if the user is connected to testnet by checking if the genesis hash matches the expected one.
        // Emit a warning and disconnect if it's the wrong chain.
        if (genesisHash !== network.genesisHash) {
            // eslint-disable-next-line no-alert
            window.alert(
                `Unexpected genesis hash '${genesisHash}'. Expected ${network.genesisHash} (network "${network.name}").`
            );
            connection.disconnect().catch(console.error);
        }
    }

    onDisconnect(connection: WalletConnection) {
        const { activeConnection } = this.state;
        if (connection === activeConnection) {
            console.log('clearing wallet connection');
            this.setState((state) => ({ ...state, activeConnection: undefined, connectedAccount: undefined }));
        }
    }

    render() {
        const { children } = this.props;
        return children({
            ...this.state,
            setConnectorType: this.setConnectorType,
        });
    }
}

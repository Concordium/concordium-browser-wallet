/* eslint-disable no-console */
/* eslint-disable no-alert */
/* eslint-disable react/sort-comp */
/* eslint-disable react/no-unused-class-component-methods */

import React from 'react';
import { SignClientTypes } from '@walletconnect/types';
import {
    connectedAccountOf,
    WalletConnectionDelegate,
    destroy,
    Network,
    WalletConnection,
    WalletConnector,
} from './WalletConnection';
import { BrowserWalletConnector } from './BrowserWallet';
import { WalletConnectConnector } from './WalletConnect';

interface State {
    connectorType: ConnectorType | undefined;
    connector: WalletConnector | undefined;
    activeConnection: WalletConnection | undefined;
    connectedAccount: string | undefined;
}

interface Props {
    network: Network; // not expected to change
    walletConnectOpts: SignClientTypes.Options; // not expected to change
    children: (props: WalletConnectionProps) => React.ReactNode;
}

export interface WalletConnectionProps extends State {
    setConnectorType: (t: ConnectorType | undefined) => void;
    setActiveConnection: (c: WalletConnection | undefined) => void;
}

type ConnectorType = 'BrowserWallet' | 'WalletConnect';

// eslint-disable-next-line react/prefer-stateless-function
export class WithWalletConnection extends React.Component<Props, State> implements WalletConnectionDelegate {
    constructor(props: Props) {
        super(props);
        this.state = {
            connectorType: undefined,
            connector: undefined,
            activeConnection: undefined,
            connectedAccount: undefined,
        };
    }

    setConnectorType = (type: ConnectorType | undefined) => {
        const { network } = this.props;
        const { connectorType, connector } = this.state;
        if (type !== connectorType) {
            // TODO Let the app do this.
            if (connector) {
                destroy(connector).catch(console.error);
            }
            this.setState((state) => ({
                ...state,
                connectorType: type,
                connector: undefined,
                activeConnection: undefined,
                connectedAccount: undefined,
            }));
            if (type) {
                this.createConnector(type, network).then(this.setConnector).catch(console.error);
            }
        }
    };

    private setConnector = (connector: WalletConnector) => {
        console.log('WithWalletConnection: updating connector state', { connector, state: this.state });
        return this.setState((state) => ({ ...state, connector }));
    };

    setActiveConnection = (connection: WalletConnection | undefined) => {
        console.debug('WithWalletConnection: setActiveConnection called', { connection, state: this.state });
        // TODO Should set active connector to the one of the connection?
        connectedAccountOf(connection).then((connectedAccount) => {
            console.log('WithWalletConnection: updating active connection and connected account state', {
                connection,
                connectedAccount,
            });
            this.setState((state) => ({
                ...state,
                activeConnection: connection,
                connectedAccount,
            }));
        });
    };

    private createConnector = (connectorType: string | undefined, network: Network): Promise<WalletConnector> => {
        console.debug('WithWalletConnection: createConnector called', { connectorType, network, state: this.state });
        const { walletConnectOpts } = this.props;
        switch (connectorType) {
            case 'BrowserWallet':
                console.log('WithWalletConnection: initializing Browser Wallet connector');
                return BrowserWalletConnector.create(this);
            case 'WalletConnect':
                console.log('WithWalletConnection: initializing WalletConnect connector');
                return WalletConnectConnector.create(walletConnectOpts, network, this);
            default:
                throw new Error(`invalid connector type '${connectorType}'`);
        }
    };

    onAccountChanged = (connection: WalletConnection, address: string | undefined) => {
        console.debug('WithWalletConnection: onAccountChanged called', { connection, address, state: this.state });
        const { activeConnection } = this.state;
        if (connection === activeConnection) {
            console.log('WithWalletConnection: updating connected account state', { address });
            this.setState((state) => ({ ...state, connectedAccount: address }));
        }
    };

    onChainChanged = (connection: WalletConnection, genesisHash: string) => {
        console.debug('WithWalletConnection: onChainChanged called', { connection, genesisHash, state: this.state });
        const { network } = this.props;
        // Check if the user is connected to testnet by checking if the genesis hash matches the expected one.
        // Emit a warning and disconnect if it's the wrong chain.
        if (genesisHash !== network.genesisHash) {
            window.alert(
                `Unexpected genesis hash '${genesisHash}'. Expected '${network.genesisHash}' (network '${network.name}').`
            );
            connection.disconnect().catch(console.error);
        }
    };

    onDisconnect = (connection: WalletConnection) => {
        console.debug('WithWalletConnection: onDisconnect called', { connection, state: this.state });
        const { activeConnection } = this.state;
        if (connection === activeConnection) {
            console.log('WithWalletConnection: clearing wallet connection and connected account state');
            this.setState((state) => ({ ...state, activeConnection: undefined, connectedAccount: undefined }));
        }
    };

    render() {
        const { children } = this.props;
        return children({
            ...this.state,
            setConnectorType: this.setConnectorType,
            setActiveConnection: this.setActiveConnection,
        });
    }
}

/* eslint-disable no-console */
/* eslint-disable react/sort-comp */
/* eslint-disable react/no-unused-class-component-methods */

import React from 'react';
import { SignClientTypes } from '@walletconnect/types';
import {
    connectedAccountOf,
    Network,
    WalletConnection,
    WalletConnectionDelegate,
    WalletConnector,
} from './WalletConnection';
import { BrowserWalletConnector } from './BrowserWallet';
import { WalletConnectConnector } from './WalletConnect';

interface State {
    activeConnectorType: string | undefined;
    activeConnector: WalletConnector | undefined;
    activeConnectorError: string;
    isActiveConnectorWaitingForUser: boolean;
    activeConnection: WalletConnection | undefined;
    activeConnectionGenesisHash: string | undefined;
    activeConnectedAccount: string | undefined;
}

// TODO React appropriately if 'network' changes.
interface Props {
    network: Network; // not expected to change
    walletConnectOpts: SignClientTypes.Options; // not expected to change
    children: (props: WalletConnectionProps) => React.ReactNode;
}

export interface WalletConnectionProps extends State {
    network: Network;
    activeConnectionGenesisHash: string | undefined;
    setActiveConnectorType: (t: string | undefined) => void;
    setActiveConnection: (c: WalletConnection | undefined) => void;
    connect: () => void;
}

// eslint-disable-next-line react/prefer-stateless-function
export class WithWalletConnection extends React.Component<Props, State> implements WalletConnectionDelegate {
    constructor(props: Props) {
        super(props);
        this.state = {
            activeConnectorType: undefined,
            activeConnector: undefined,
            activeConnectorError: '',
            isActiveConnectorWaitingForUser: false,
            activeConnection: undefined,
            activeConnectionGenesisHash: undefined,
            activeConnectedAccount: undefined,
        };
    }

    setActiveConnectorType = (type: string | undefined) => {
        const { network } = this.props;
        const { activeConnectorType } = this.state;
        if (type === activeConnectorType) {
            return; // ensure idempotency
        }
        this.setState({
            activeConnectorType: type,
            activeConnector: undefined,
            activeConnection: undefined,
            activeConnectorError: '',
            isActiveConnectorWaitingForUser: false,
            activeConnectionGenesisHash: undefined,
            activeConnectedAccount: undefined,
        });
        if (type) {
            this.createConnector(type, network)
                .then(this.setActiveConnector)
                .catch((err) => {
                    // eslint-disable-next-line react/destructuring-assignment
                    if (this.state.activeConnectorType === type) {
                        // Don't set error if user switched connector type since initializing this connector.
                        // It's OK to show it if the user switched away and back...
                        this.setState({ activeConnectorError: (err as Error).message });
                    }
                });
        }
    };

    private setActiveConnector = (connector: WalletConnector) => {
        console.log('WithWalletConnection: updating active connector state', { connector, state: this.state });
        this.setState({ activeConnector: connector, activeConnectorError: '' });
    };

    setActiveConnection = (connection: WalletConnection | undefined) => {
        console.debug("WithWalletConnection: calling 'setActiveConnection'", { connection, state: this.state });
        // Not setting the active connector to that of the connection
        // as it isn't obvious that one would always want that.
        // The app can just do it explicitly.
        connectedAccountOf(connection).then((connectedAccount) => {
            console.log('WithWalletConnection: updating active connection and connected account state', {
                connection,
                connectedAccount,
            });
            this.setState({
                activeConnection: connection,
                activeConnectedAccount: connectedAccount,
            });
        });
    };

    private createConnector = (connectorType: string, network: Network): Promise<WalletConnector> => {
        console.debug("WithWalletConnection: calling 'createConnector'", { connectorType, network, state: this.state });
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
        console.debug("WithWalletConnection: calling 'onAccountChanged'", { connection, address, state: this.state });
        const { activeConnection } = this.state;
        // Ignore event on connections other than the active one.
        if (connection === activeConnection) {
            console.log('WithWalletConnection: updating connected account state', { address });
            this.setState({ activeConnectedAccount: address });
        }
    };

    onChainChanged = (connection: WalletConnection, genesisHash: string) => {
        console.debug("WithWalletConnection: calling 'onChainChanged'", { connection, genesisHash, state: this.state });
        const { activeConnection } = this.state;
        if (connection === activeConnection) {
            this.setState({ activeConnectionGenesisHash: genesisHash });
        }
    };

    onDisconnect = (connection: WalletConnection) => {
        console.debug("WithWalletConnection: calling 'onDisconnect'", { connection, state: this.state });
        const { activeConnection } = this.state;
        // Ignore event on connections other than the active one.
        if (connection === activeConnection) {
            console.log('WithWalletConnection: clearing wallet connection and connected account state');
            this.setState({ activeConnection: undefined, activeConnectedAccount: undefined });
        }
    };

    connect = () => {
        const { activeConnector } = this.state;
        if (activeConnector) {
            this.setState({ isActiveConnectorWaitingForUser: true });
            activeConnector
                .connect()
                .then(this.setActiveConnection)
                .catch((err) => {
                    // eslint-disable-next-line react/destructuring-assignment
                    if (this.state.activeConnector === activeConnector) {
                        this.setState({ activeConnectorError: (err as Error).message });
                    }
                })
                .finally(() => {
                    // eslint-disable-next-line react/destructuring-assignment
                    if (this.state.activeConnector === activeConnector) {
                        this.setState({ isActiveConnectorWaitingForUser: false });
                    }
                });
        }
    };

    render() {
        const { children, network } = this.props;
        return children({
            ...this.state,
            network,
            setActiveConnectorType: this.setActiveConnectorType,
            setActiveConnection: this.setActiveConnection,
            connect: this.connect,
        });
    }
}

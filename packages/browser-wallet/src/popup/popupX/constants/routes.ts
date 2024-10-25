import { AccountAddress, TransactionHash } from '@concordium/web-sdk';

export type RouteConfig = {
    hideBackArrow?: boolean;
    backTitle?: string;
    hideMenu?: boolean;
    hideConnection?: boolean;
    showAccountSelector?: boolean;
};
export type RoutePath = {
    path: string;
    config?: RouteConfig;
};
export type RouteNode = RoutePath & RouteChildren;
export type RouteChildren = {
    [key: string]: RouteNode | RoutePath;
};

export const relativeRoutes = {
    onboarding: {
        path: 'onboarding',
        config: {
            hideBackArrow: true,
            backTitle: '',
            hideMenu: true,
            hideConnection: true,
        },
        setupPassword: {
            path: 'setupPassword',
            config: {
                hideBackArrow: true,
                backTitle: '',
                hideMenu: true,
                hideConnection: true,
            },
        },
        idIntro: {
            path: 'idIntro',
            config: {
                backTitle: '',
                hideMenu: true,
                hideConnection: true,
            },
        },
        requestIdentity: {
            path: 'requestIdentity',
            config: {
                backTitle: '',
                hideMenu: true,
                hideConnection: true,
            },
        },
        idSubmitted: {
            path: 'idSubmitted',
            config: {
                backTitle: '',
                hideMenu: true,
                hideConnection: true,
            },
        },
    },
    home: {
        path: 'home',
        config: {
            hideBackArrow: true,
        },
        send: {
            path: 'send',
            confirmation: {
                path: 'confirmation',
                config: {
                    backTitle: 'to Send Funds form',
                },
            },
        },
        receive: {
            path: 'receive',
        },
        transactionLog: {
            path: 'account/:account/transactions',
            details: {
                path: ':transactionHash',
                config: {
                    backTitle: 'to Transaction log',
                },
            },
        },
        token: {
            path: 'token',
        },
        submittedTransaction: {
            path: 'submitted/:transactionHash',
            config: {
                hideBackArrow: true,
            },
        },
    },
    settings: {
        path: 'settings',
        idCards: {
            path: 'idCards',
        },
        about: {
            path: 'about',
        },
        accounts: {
            path: 'accounts',
            connectedSites: {
                path: 'connectedSites',
                config: {
                    backTitle: 'to Accounts list',
                },
            },
            privateKey: {
                path: 'privateKey',
            },
        },
        seedPhrase: {
            path: 'seedPhrase',
            config: {
                backTitle: '',
            },
        },
        passcode: {
            path: 'passcode',
        },
        web3Id: {
            path: 'web3Id',
            import: {
                path: 'import',
            },
        },
        network: {
            path: 'network',
            connect: {
                path: 'connect',
                config: {
                    backTitle: 'Network settings',
                },
            },
        },
        restore: {
            path: 'restore',
            result: {
                path: 'result',
                config: {
                    backTitle: 'Restore wallet',
                },
            },
        },
        /** Routes related to staking for the currently selected account */
        earn: {
            path: 'earn',
            /** Validation related routes */
            validator: {
                path: 'baker',
                intro: {
                    path: 'intro',
                },
                register: {
                    path: 'register',
                },
                openPool: {
                    path: 'openPool',
                },
                keys: {
                    path: 'keys',
                },
            },
            /** Delegation related routes */
            delegator: {
                path: 'delegator',
                /** Configure new delegator */
                register: {
                    path: 'register',
                    configure: {
                        path: 'configure',
                    },
                },
                /** Configure existing delegator */
                update: {
                    path: 'update',
                },
                /** Submit configure delegator transaction */
                submit: {
                    path: 'submit',
                },
            },
        },
    },
    prompt: {
        path: 'prompt',
        connectionRequest: {
            path: 'connectionRequest',
        },
    },
};

/**
 * The temporary prefix for all wallet-x routes in the application.
 */
export const routePrefix = '/walletX'; // FIXME: Remove hardcoded walletX prefix.

const buildAbsoluteRoutes = <R extends RouteNode | RoutePath | RouteChildren>(
    route: R,
    root = true,
    base?: string
): R => {
    const { path, config, ...rs } = route;

    let aPath = path as string | undefined;

    if (root) {
        aPath = routePrefix; // FIXME: Remove hardcoded walletX prefix.
    } else if (base !== undefined) {
        aPath = `${base}/${path}`;
    }

    return Object.entries(rs).reduce(
        (acc, [k, r]) => ({
            ...acc,
            [k]: buildAbsoluteRoutes(r as R, false, aPath),
        }),
        { path: aPath }
    ) as R;
};

export const absoluteRoutes = buildAbsoluteRoutes(relativeRoutes);

export const transactionDetailsRoute = (account: AccountAddress.Type, tx: TransactionHash.Type) =>
    absoluteRoutes.home.transactionLog.details.path
        .replace(':account', account.address)
        .replace(':transactionHash', TransactionHash.toHexString(tx));

export const submittedTransactionRoute = (tx: TransactionHash.Type) =>
    absoluteRoutes.home.submittedTransaction.path.replace(':transactionHash', TransactionHash.toHexString(tx));

/**
 * Given two absolute routes, returns the relative route between them.
 * Note: fromPath should be a prefix of toPath.
 */
export function relativePath(fromPath: string, toPath: string) {
    if (!toPath.startsWith(fromPath)) {
        throw new Error('fromPath is not a prefix of toPath');
    }
    return toPath.substring(fromPath.length).replace(/^\/+/, '');
}

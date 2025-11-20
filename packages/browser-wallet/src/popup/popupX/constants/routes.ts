import { AccountAddress, ContractAddress, TransactionHash } from '@concordium/web-sdk';
import { generatePath } from 'react-router-dom';
import i18n from '@popup/shell/i18n';

export type RouteConfig = {
    hideBackArrow?: boolean;
    backTitle?: string;
    navBackSteps?: number;
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
        welcome: {
            path: 'welcome',
            config: {
                hideBackArrow: true,
                backTitle: '',
                hideMenu: true,
                hideConnection: true,
            },
            setupPassword: {
                path: 'setupPassword',
                config: {
                    backTitle: i18n.t('x:header.navButton.back'),
                    hideMenu: true,
                    hideConnection: true,
                },
                createOrRestore: {
                    path: 'createOrRestore',
                    config: {
                        backTitle: i18n.t('x:header.navButton.back'),
                        hideMenu: true,
                        hideConnection: true,
                    },
                    selectNetwork: {
                        path: 'selectNetwork',
                        config: {
                            hideBackArrow: false,
                            backTitle: '',
                            hideMenu: true,
                            hideConnection: true,
                        },
                        custom: {
                            path: 'custom',
                            config: {
                                backTitle: '',
                                hideMenu: true,
                                hideConnection: true,
                            },
                        },
                    },
                    restoreWallet: {
                        path: 'restoreWallet',
                        config: {
                            hideBackArrow: false,
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
                },
            },
        },
    },
    home: {
        path: 'home',
        config: {
            hideBackArrow: true,
            showAccountSelector: true,
        },
        sendFunds: {
            path: 'account/:account/send-funds',
            config: {
                navBackSteps: 3,
            },
        },
        receive: {
            path: 'receive',
        },
        onramp: {
            path: 'onramp',
        },
        transactionLog: {
            path: 'account/:account/transactions',
            config: {
                navBackSteps: 3,
            },
            details: {
                path: ':transactionHash',
                config: {
                    backTitle: i18n.t('x:transactionLogX.details.backTitle'),
                },
            },
        },
        token: {
            path: 'token',
            ccd: {
                path: 'ccd',
                config: {
                    navBackSteps: 2,
                },
            },
            plt: {
                path: 'plt/:pltSymbol',
                config: {
                    navBackSteps: 3,
                },
                raw: {
                    path: 'raw',
                },
            },
            details: {
                path: ':contractIndex',
                config: {
                    navBackSteps: 2,
                },
                raw: {
                    path: 'raw',
                },
            },
        },
        submittedTransaction: {
            path: 'submitted/:transactionHash',
            config: {
                hideBackArrow: true,
                navBackSteps: 2,
            },
        },
        manageTokenList: {
            path: 'manageTokenList',
            addToken: {
                path: 'addToken',
            },
        },
    },
    settings: {
        path: 'settings',
        identities: {
            path: 'identities',
            create: {
                path: 'create',
                externalFlow: {
                    path: 'external-flow',
                    config: {
                        hideMenu: true,
                    },
                },
                submitted: {
                    path: 'submitted',
                    config: {
                        hideMenu: true,
                        hideBackArrow: true,
                    },
                },
                failed: {
                    path: 'failed',
                    config: {
                        hideMenu: true,
                    },
                },
            },
        },
        about: {
            path: 'about',
        },
        accounts: {
            path: 'accounts',
            connectedSites: {
                path: 'connected-sites/:account',
                config: {
                    backTitle: i18n.t('x:connectedSites.backTitle'),
                    navBackSteps: 2,
                },
            },
            privateKey: {
                path: 'private-key/:account',
                config: {
                    navBackSteps: 2,
                },
            },
        },
        createAccount: {
            path: 'create-account',
            confirm: {
                path: 'confirm/:identityProviderIndex/:identityIndex',
                config: {
                    navBackSteps: 3,
                },
            },
            config: {
                backTitle: ' ',
            },
        },
        seedPhrase: {
            path: 'seedPhrase',
            config: {
                backTitle: '',
            },
        },
        saveSeedPhrase: {
            path: 'saveSeedPhrase',
            config: {
                backTitle: i18n.t('x:header.navButton.back'),
                hideMenu: true,
                hideConnection: true,
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
            details: {
                path: ':sci/:holderId',
                config: {
                    backTitle: i18n.t('x:web3Id.credentials.title'),
                },
            },
        },
        network: {
            path: 'network',
            connect: {
                path: 'connect/:genesisHash',
                config: {
                    backTitle: i18n.t('x:connect.backTitle'),
                    navBackSteps: 2,
                },
            },
            custom: {
                path: 'custom',
                config: {
                    backTitle: i18n.t('x:connect.backTitle'),
                },
            },
        },
        restore: {
            path: 'restore',
            main: {
                path: 'main',
                config: {
                    hideMenu: true,
                    hideBackArrow: true,
                },
            },
        },
        nft: {
            path: 'nft',
            details: {
                path: ':contractIndex/:id/details',
                config: {
                    navBackSteps: 3,
                },
                raw: {
                    path: 'raw',
                },
            },
        },
        /** Routes related to staking for the currently selected account */
        earn: {
            path: 'earn',
            /** Validation section */
            validator: {
                path: 'baker',
                config: {
                    navBackSteps: 2,
                },
                /** Configure new validator */
                register: {
                    path: 'register',
                    config: {
                        backTitle: i18n.t('x:earn.validator.register.backTitle'),
                        navBackSteps: 2,
                    },
                    /** Flow for constructing the transaction */
                    configure: {
                        config: {
                            backTitle: i18n.t('x:earn.validator.register.backTitle'),
                        },
                        path: 'configure',
                    },
                },
                /** Configure existing delegator */
                update: {
                    path: 'update',
                    config: {
                        backTitle: i18n.t('x:earn.validator.update.backTitle'),
                    },
                    /** Update validator stake */
                    stake: {
                        path: 'stake',
                        config: {
                            backTitle: i18n.t('x:earn.validator.update.step.backTitle'),
                        },
                    },
                    /** Update validator pool settings */
                    settings: {
                        path: 'settings',
                        config: {
                            backTitle: i18n.t('x:earn.validator.update.step.backTitle'),
                        },
                    },
                    /** Update validator keys */
                    keys: {
                        path: 'keys',
                        config: {
                            backTitle: i18n.t('x:earn.validator.update.step.backTitle'),
                        },
                    },
                },
                /** Submit configure validator transaction */
                submit: {
                    path: 'submit',
                    config: {
                        backTitle: i18n.t('x:earn.validator.submit.backTitle'),
                    },
                },
                /** Self-suspend info page */
                selfSuspend: {
                    path: 'selfSuspend',
                },
            },
            /** Delegation section */
            delegator: {
                path: 'delegator',
                config: {
                    backTitle: i18n.t('x:earn.delegator.status.backTitle'),
                    navBackSteps: 2,
                },
                /** Configure new delegator */
                register: {
                    path: 'register',
                    config: {
                        backTitle: i18n.t('x:earn.delegator.register.backTitle'),
                    },
                    /** Flow for constructing the transaction */
                    configure: {
                        config: {
                            backTitle: i18n.t('x:earn.delegator.register.backTitle'),
                        },
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
                    config: {
                        backTitle: i18n.t('x:earn.delegator.submit.backTitle'),
                    },
                },
            },
        },
    },
    prompt: {
        path: 'prompt',
        connectionRequest: {
            path: 'connectionRequest',
        },
        connectAccountsRequest: {
            path: 'connectAccountsRequest',
        },
        addTokens: {
            path: 'addTokens',
        },
        recovery: {
            path: 'recovery',
        },
        endIdentityIssuance: {
            path: 'end-identity-issuance',
        },
        signCIS3Message: {
            path: 'signCIS3Message',
        },
        signMessage: {
            path: 'signMessage',
        },
        sendTransaction: {
            path: 'sendTransaction',
        },
        addWeb3IdCredential: {
            path: 'add-web3id-credential',
        },
        idProof: {
            path: 'id-proof',
        },
        web3IdProof: {
            path: 'web3Id-proof',
        },
        ageProof: {
            path: 'age-proof',
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

export const transactionLogRoute = (account: AccountAddress.Type) =>
    generatePath(absoluteRoutes.home.transactionLog.path, {
        account: account.address,
    });

export const transactionDetailsRoute = (account: AccountAddress.Type, tx: TransactionHash.Type) =>
    generatePath(absoluteRoutes.home.transactionLog.details.path, {
        account: account.address,
        transactionHash: TransactionHash.toHexString(tx),
    });

export const submittedTransactionRoute = (tx: TransactionHash.Type) =>
    generatePath(absoluteRoutes.home.submittedTransaction.path, { transactionHash: TransactionHash.toHexString(tx) });

export const sendFundsRoute = (account: AccountAddress.Type) =>
    generatePath(absoluteRoutes.home.sendFunds.path, { account: account.address });

export const web3IdDetailsRoute = (contract: ContractAddress.Type, holderId: string) =>
    generatePath(absoluteRoutes.settings.web3Id.details.path, {
        sci: `${contract.index}-${contract.subindex}`,
        holderId,
    });

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

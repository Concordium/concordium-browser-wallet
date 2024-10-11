type RoutePath = {
    path: string;
};
type RouteNode = RouteChildren & RoutePath;
type RouteChildren = {
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
                confirmed: {
                    path: 'confirmed',
                    config: {
                        hideBackArrow: true,
                    },
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
        earn: {
            path: 'earn',
            baker: {
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
                bakerKeys: {
                    path: 'bakerKeys',
                },
            },
            delegator: {
                path: 'delegator',
                intro: {
                    path: 'intro',
                },
                type: {
                    path: 'type',
                },
                register: {
                    path: 'register',
                },
                result: {
                    path: 'result',
                },
            },
        },
    },
};

const buildAbsoluteRoutes = <R extends RouteNode | RoutePath | RouteChildren>(route: R, base?: string): R => {
    const { path, config, ...rs } = route;

    let aPath = path as string | undefined;

    if (base === '/') {
        aPath = `/${path}`;
    } else if (base !== undefined) {
        aPath = `${base}/${path}`;
    }

    return Object.entries(rs).reduce(
        (acc, [k, r]) => ({
            ...acc,
            [k]: buildAbsoluteRoutes(r as R, aPath),
        }),
        { path: aPath }
    ) as R;
};

export const absoluteRoutes = buildAbsoluteRoutes(relativeRoutes);

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

type RoutePath = {
    path: string;
};
type RouteNode = RouteChildren & RoutePath;
type RouteChildren = {
    [key: string]: RouteNode | RoutePath;
};

export const relativeRoutes = {
    home: {
        path: '/',
        account: {
            path: 'account',
            add: { path: 'add' },
            tokens: { path: 'tokens' },
        },
        identities: {
            path: 'identities',
            add: { path: 'add' },
        },
        verifiableCredentials: {
            path: 'verifiable-credentials',
        },
        settings: {
            path: 'settings',
            allowlist: {
                path: 'allowlist',
            },
            passcode: {
                path: 'passcode',
            },
            network: {
                path: 'network',
            },
            recovery: {
                path: 'recovery',
            },
            about: {
                path: 'about',
            },
        },
    },
    prompt: {
        path: '/prompt',
        connectionRequest: {
            path: 'connection-request',
        },
        addWeb3IdCredential: {
            path: 'add-web3id-credential',
        },
        connectAccountsRequest: {
            path: 'connect-accounts-request',
        },
        signMessage: {
            path: 'sign-message',
        },
        sendTransaction: {
            path: 'send-transaction',
        },
        endIdentityIssuance: {
            path: 'end-identity-issuance',
        },
        recovery: {
            path: 'recovery',
        },
        addTokens: {
            path: 'add-tokens',
        },
        idProof: {
            path: 'id-proof',
        },
    },
    setup: {
        path: '/setup',
    },
    recovery: {
        path: '/recovery',
    },
    login: {
        path: '/login',
    },
    termsAndConditions: {
        path: '/terms-recovery',
    },
};

const buildAbsoluteRoutes = <R extends RouteNode | RoutePath | RouteChildren>(route: R, base?: string): R => {
    const { path, ...rs } = route;

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
    return toPath.substring(fromPath.length);
}

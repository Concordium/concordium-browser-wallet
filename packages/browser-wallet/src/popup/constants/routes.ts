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
        },
        identities: {
            path: 'identities',
            add: { path: 'add' },
        },
        settings: {
            path: 'settings',
            passcode: {
                path: 'passcode',
            },
            network: {
                path: 'network',
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
        signMessage: {
            path: 'sign-message',
        },
        sendTransaction: {
            path: 'send-transaction',
        },
        endIdentityIssuance: {
            path: 'end-identity-issuance',
        },
    },
    setup: {
        path: '/setup',
    },
    login: {
        path: '/login',
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

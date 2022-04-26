type RouteLeaf = {
    path: string;
};
type RouteNode = RouteChildren & RouteLeaf;
type RouteChildren = {
    [key: string]: RouteNode | RouteLeaf;
};

export const relativeRoutes = {
    home: {
        path: '/',
        accounts: {
            path: 'accounts',
            account: {
                path: ':address',
            },
        },
    },
    signMessage: {
        path: '/sign-message',
    },
    sendTransaction: {
        path: '/send-transaction',
    },
    setup: {
        path: '/setup',
    },
};

const buildAbsoluteRoutes = <R extends RouteNode | RouteLeaf | RouteChildren>(route: R, base?: string): R => {
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

import React, { useEffect } from 'react';
import { Link, Outlet, Route, Routes as ReactRoutes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { absoluteRoutes, relativeRoutes } from '@popup/constants/routes';

function MainLayout() {
    return (
        <>
            <main className="root root--emph">
                Hello <span className="root__world">World!</span>
            </main>
            <nav>
                <Link to={absoluteRoutes.home.path}>Home</Link> |{' '}
                <Link to={absoluteRoutes.home.accounts.path}>Accounts</Link> |{' '}
                <Link to={absoluteRoutes.setup.path}>Setup</Link>
            </nav>
            <Outlet />
        </>
    );
}

function Home() {
    return <>Home</>;
}

function Accounts() {
    const { state } = useLocation();

    // eslint-disable-next-line no-console
    console.log(state);

    return (
        <>
            <div>Accounts</div>
            <Outlet />
        </>
    );
}

const buildAccountRoute = (address: string) =>
    absoluteRoutes.home.accounts.account.path.replace(relativeRoutes.home.accounts.account.path, address);

function SelectAccount() {
    return (
        <>
            <Link to={buildAccountRoute('123')} />
            <Link to={buildAccountRoute('234')} />
        </>
    );
}

function Account() {
    const { address } = useParams();

    return (
        <>
            <div>Address: {address}</div>
            <Link to={absoluteRoutes.home.accounts.path} />
        </>
    );
}

function SignMessage() {
    const { state } = useLocation();

    return (
        <>
            <div>Sign message</div>
            {JSON.stringify(state)}
        </>
    );
}

function Setup() {
    return <>Setup</>;
}

export default function Routes() {
    const navigate = useNavigate();

    useEffect(() => {
        chrome.runtime.onMessage.addListener((msg) => {
            // TODO resolve route based on incoming message.
            navigate(absoluteRoutes.signMessage.path, { state: msg });
        });
    }, []);

    return (
        <ReactRoutes>
            <Route path={relativeRoutes.home.path} element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path={relativeRoutes.home.accounts.path} element={<Accounts />}>
                    <Route index element={<SelectAccount />} />
                    <Route path={relativeRoutes.home.accounts.account.path} element={<Account />} />
                </Route>
            </Route>
            <Route path={relativeRoutes.signMessage.path} element={<SignMessage />} />
            <Route path={relativeRoutes.setup.path} element={<Setup />} />
        </ReactRoutes>
    );
}

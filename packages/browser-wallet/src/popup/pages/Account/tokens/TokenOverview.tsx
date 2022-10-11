import React from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';
import { absoluteRoutes } from '@popup/constants/routes';
import TabBar from '@popup/shared/TabBar';
import PlusIcon from '@assets/svg/plus.svg';
import { tokensRoutes } from './routes';

function Fungibles() {
    const items = [1, 2, 3, 4, 5, 6];
    return (
        <>
            {items.map((i) => (
                <div className="token-list__item" role="button">
                    {i}
                </div>
            ))}
        </>
    );
}

function TokensOverview() {
    return (
        <div className="tokens-overview">
            <TabBar className="tokens-overview__actions">
                <TabBar.Item className="tokens-overview__link" to="" end>
                    Fungible
                </TabBar.Item>
                <TabBar.Item className="tokens-overview__link" to={tokensRoutes.collectibles}>
                    Collectibles
                </TabBar.Item>
                <TabBar.Item className="tokens-overview__link" to={absoluteRoutes.home.account.tokens.add.path}>
                    <div className="tokens-overview__add">
                        Add new
                        <PlusIcon />
                    </div>
                </TabBar.Item>
            </TabBar>
            <div className="tokens-overview__scroll">
                <Outlet />
            </div>
        </div>
    );
}

export default function Main() {
    return (
        <Routes>
            <Route element={<TokensOverview />}>
                <Route index element={<Fungibles />} />
                <Route path={tokensRoutes.collectibles} element={<Fungibles />} />
            </Route>
        </Routes>
    );
}

import React from 'react';
import { NavLink, Outlet, Route, Routes } from 'react-router-dom';
import { absoluteRoutes } from '@popup/constants/routes';
import { tokensRoutes } from './routes';

function TokensOverview() {
    return (
        <>
            <nav>
                <NavLink to="">Fungible</NavLink>
                <NavLink to={tokensRoutes.collectibles}>Collectibles</NavLink>
                <NavLink to={absoluteRoutes.home.account.tokens.add.path} title="Add new token">
                    Add new
                </NavLink>
            </nav>
            <Outlet />
        </>
    );
}

export default function Main() {
    return (
        <Routes>
            <Route element={<TokensOverview />}>
                <Route index element={<>Fungible</>} />
                <Route path={tokensRoutes.collectibles} element={<>Collectibles</>} />
            </Route>
        </Routes>
    );
}

import React from 'react';
import { NavLink } from 'react-router-dom';
import { accountRoutes } from '../routes';

export default function AccountActions() {
    return (
        <nav className="account-page-actions">
            <NavLink to="">L</NavLink>
            <NavLink to={accountRoutes.send}>S</NavLink>
            <NavLink to={accountRoutes.receive}>R</NavLink>
            <NavLink to={accountRoutes.settings}>S</NavLink>
        </nav>
    );
}

import React from 'react';
import { NavLink } from 'react-router-dom';
import { absoluteRoutes } from '@popup/constants/routes';

export default function Main() {
    return (
        <NavLink className="account-page-actions__link" to={absoluteRoutes.home.account.tokens.add.path} title="Add new tokens">
            Add
        </NavLink>
        );
    }

import { Provider } from 'jotai';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import './i18n';

import Routes from './Routes';

export default function Root() {
    return (
        <Provider>
            <MemoryRouter>
                <Routes />
            </MemoryRouter>
        </Provider>
    );
}

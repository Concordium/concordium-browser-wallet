import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import Routes from '../Routes';

export default function Root() {
    return (
        <MemoryRouter>
            <Routes />
        </MemoryRouter>
    );
}

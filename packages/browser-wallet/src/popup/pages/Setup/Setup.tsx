import { absoluteRoutes } from '@popup/constants/routes';
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Setup() {
    const navigate = useNavigate();

    return (
        <>
            <header>Setup process</header>
            <main>
                <button type="button" onClick={() => navigate(absoluteRoutes.home.path)}>
                    Continue
                </button>
            </main>
        </>
    );
}

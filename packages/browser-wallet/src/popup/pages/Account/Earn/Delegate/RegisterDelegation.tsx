import React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';

import Carousel from '@popup/shared/Carousel';
import ConfigureDelegationFlow from './ConfigureDelegationFlow';

const routes = {
    configure: 'configure',
};

function Intro() {
    const nav = useNavigate();

    const goToRegister = () => {
        nav(routes.configure);
    };

    return (
        <Carousel className="earn-carousel" onContinue={goToRegister}>
            <div>First</div>
            <div>Second</div>
            <div>Third</div>
        </Carousel>
    );
}

export default function RegisterDelegation() {
    return (
        <Routes>
            <Route index element={<Intro />} />
            <Route path={`${routes.configure}/*`} element={<ConfigureDelegationFlow title="Register delegation" />} />
        </Routes>
    );
}

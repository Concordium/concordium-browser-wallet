import React from 'react';
import { useNavigate } from 'react-router-dom';

import Carousel from '@popup/shared/Carousel';

const routes = {
    intro: 'intro',
    register: 'register',
    preUdpate: 'pre-update',
    update: 'update',
    preRemove: 'pre-remove',
    remove: 'remove',
};

function Intro() {
    const nav = useNavigate();
    return (
        <Carousel onContinue={() => nav(routes.register)}>
            <div>First</div>
            <div>Second</div>
            <div>Third</div>
        </Carousel>
    );
}

export default function Delegate() {
    return <Intro />;
}

import React from 'react';
import { MemoryRouter, Link, Outlet, Route, Routes } from 'react-router-dom';

function MainLayout() {
    return (
        <>
            <main className="root root--emph">
                Hello <span className="root__world">World!</span>
            </main>
            <nav>
                <Link to="/">Home</Link>
                <Link to="/setup">Setup</Link>
            </nav>
            <Outlet />
        </>
    );
}

function Home() {
    return <>Home</>;
}

function Setup() {
    return <>Setup</>;
}

export default function Root() {
    return (
        <MemoryRouter>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<Home />} />
                </Route>
                <Route path="/setup" element={<Setup />} />
            </Routes>
        </MemoryRouter>
    );
}

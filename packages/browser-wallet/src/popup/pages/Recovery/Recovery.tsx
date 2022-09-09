import React from 'react';
import { Route, Routes } from 'react-router-dom';
import RecoveryIntro from './RecoveryIntro';
import RecoveryMain from './RecoveryMain';

export default function Recovery() {
    return (
        <Routes>
            <Route index element={<RecoveryIntro />} />
            <Route path="main" element={<RecoveryMain className="h-full" />} />
        </Routes>
    );
}

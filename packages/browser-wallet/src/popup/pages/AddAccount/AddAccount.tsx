import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ChooseIdentity from './ChooseIdentity';
import Confirm from './Confirm';

export default function AddAccount() {
    return (
        <Routes>
            <Route index element={<ChooseIdentity />} />
            <Route path="confirm" element={<Confirm />} />
        </Routes>
    );
}

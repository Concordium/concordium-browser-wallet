import React from 'react';
import { useLocation } from 'react-router-dom';

export default function SendTransaction() {
    const { state } = useLocation();

    return (
        <>
            <div>Send transaction</div>
            {JSON.stringify(state)}
        </>
    );
}

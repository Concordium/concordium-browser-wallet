import React from 'react';
import { useLocation } from 'react-router-dom';

export default function SignMessage() {
    const { state } = useLocation();

    return (
        <>
            <div>Sign message</div>
            {JSON.stringify(state)}
        </>
    );
}

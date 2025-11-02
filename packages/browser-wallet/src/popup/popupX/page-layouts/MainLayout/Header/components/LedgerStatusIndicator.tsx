import React, { useEffect, useRef, useState } from 'react';
import LedgerOnIcon from '@assets/svgX/ledger-on.svg';
import LedgerOffIcon from '@assets/svgX/ledger-off.svg';

type LedgerStatus = 'connected' | 'disconnected';

export default function LedgerStatusIndicator() {
    const [status, setStatus] = useState<LedgerStatus>('disconnected');
    const listenerAttached = useRef(false);
    // const [connecting, setConnecting] = useState(false);
    const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

    const handleLedgerMessage = (event: MessageEvent) => {
        const { type, success } = event.data;
        if (type === 'LEDGER_CONNECTED' && success) {
            setStatus('connected');
            // setConnecting(false);
        } else if (type === 'LEDGER_CONNECTED' && !success) {
            setStatus('disconnected');
            // setConnecting(false);
        }
    };

    const getLedgerStatus = () => {
        window.postMessage({ type: 'GET_LEDGER_STATUS' }, '*');
        if (!listenerAttached.current) {
            window.addEventListener('message', handleLedgerMessage);
            listenerAttached.current = true;
        }
    };

    /* const tryConnect = () => {
        if (!connecting) {
            setConnecting(true);
            window.postMessage({ type: 'REQUEST_LEDGER_DEVICE' }, '*');
        }
    }; */

    // Poll for status
    useEffect(() => {
        getLedgerStatus();
        const interval = setInterval(getLedgerStatus, 5000);
        return () => {
            window.removeEventListener('message', handleLedgerMessage);
            listenerAttached.current = false;
            clearInterval(interval);
            if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
        };
    }, []);

    // Auto-connect if disconnected, with cooldown
    /* useEffect(() => {
        if (status === 'disconnected' && !connecting) {
            if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
            reconnectTimeout.current = setTimeout(() => {
                tryConnect();
            }, 2000); // Try to reconnect after 2 seconds
        }
    }, [status, connecting]); */

    let content;
    if (status === 'connected') {
        content = (
            <span title="Connected" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <LedgerOnIcon />
            </span>
        );
    } else {
        content = (
            <span title="Disconnected" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <LedgerOffIcon />
            </span>
        );
    }

    return <div>{content}</div>;
}

/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import LedgerOnIcon from '@assets/svgX/ledger-on.svg';
import LedgerOffIcon from '@assets/svgX/ledger-off.svg';
import clsx from 'clsx';
import { isFullscreenWindow } from '@popup/shared/window-helpers';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { InternalMessageType } from '@messaging';
import { useLocation } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '@popup/state';
import {
    connectLedgerDevice,
    LedgerDeviceInfo,
    loadLedgerConnectionState,
    disconnectLedgerDevice,
    isLedgerConnected,
    getConnectedLedgerInfo,
} from '@popup/shared/ledger-helpers';
import { LedgerConnectionSuccess, LedgerConnectionFailed } from '@popup/popupX/shared/Toast/LedgerToastMessages';
import { ENABLE_LEDGER } from '@shared/constants/features';
import LedgerConnectOverlay from './LedgerConnectOverlay';
import LedgerDeviceModal from './LedgerDeviceModal';
import LedgerDeviceConfirmModal from './LedgerDeviceConfirmModal';

type ConnectionStatus = 'pending' | 'success' | 'failed';

export default function LedgerConnection({ hideConnection }: { hideConnection?: boolean }) {
    // Return early if Ledger feature is disabled
    if (!ENABLE_LEDGER || hideConnection) {
        return null;
    }
    // State for connection status
    const [connected, setConnected] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);
    const [showDeviceModal, setShowDeviceModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [deviceInfo, setDeviceInfo] = useState<LedgerDeviceInfo | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('pending');
    const location = useLocation();
    const addToast = useSetAtom(addToastAtom);

    // Verify actual device connection on mount and listen for connection changes
    useEffect(() => {
        const checkDeviceConnection = async () => {
            const deviceConnected = await isLedgerConnected();

            if (deviceConnected) {
                // Device is physically connected, get its info
                const connectedDevice = await getConnectedLedgerInfo();
                const storedState = await loadLedgerConnectionState();

                setConnected(true);
                setDeviceInfo({
                    deviceName: connectedDevice?.deviceName || storedState?.deviceName || 'Ledger Device',
                    transport: null as any, // Transport is not persisted, will reconnect on use
                });
            } else {
                // Device not connected, clear stored state if any
                const storedState = await loadLedgerConnectionState();
                if (storedState?.isConnected) {
                    await disconnectLedgerDevice();
                }
                setConnected(false);
                setDeviceInfo(null);
            }
        };

        // Initial check
        checkDeviceConnection();

        // Listen for device connection events (hot-plug detection)
        const handleDeviceConnect = async (event: Event) => {
            const hidEvent = event as any; // WebHID event with device property
            const LEDGER_VENDOR_ID = 0x2c97;
            if (hidEvent.device?.vendorId === LEDGER_VENDOR_ID) {
                console.log('Ledger device connected:', hidEvent.device.productName);
                const connectedDevice = await getConnectedLedgerInfo();
                setConnected(true);
                setDeviceInfo({
                    deviceName: connectedDevice?.deviceName || hidEvent.device.productName || 'Ledger Device',
                    transport: null as any,
                });
            }
        };

        const handleDeviceDisconnect = async (event: Event) => {
            const hidEvent = event as any; // WebHID event with device property
            const LEDGER_VENDOR_ID = 0x2c97;
            if (hidEvent.device?.vendorId === LEDGER_VENDOR_ID) {
                console.log('Ledger device disconnected:', hidEvent.device.productName);
                await disconnectLedgerDevice();
                setConnected(false);
                setDeviceInfo(null);
                setShowConfirmModal(false);
            }
        };

        // Add event listeners if WebHID is available
        const nav = navigator as any;
        if (nav.hid) {
            nav.hid.addEventListener('connect', handleDeviceConnect);
            nav.hid.addEventListener('disconnect', handleDeviceDisconnect);
        }

        // Cleanup event listeners on unmount
        return () => {
            if (nav.hid) {
                nav.hid.removeEventListener('connect', handleDeviceConnect);
                nav.hid.removeEventListener('disconnect', handleDeviceDisconnect);
            }
        };
    }, []);

    const handleClick = () => {
        if (connected) {
            // Surface current device state so the user can disconnect if needed
            setConnectionStatus('success');
            setShowConfirmModal(true);
            return;
        }

        if (!isFullscreenWindow) {
            setShowOverlay(true);
        } else {
            setShowDeviceModal(true);
        }
    };

    const handleOpenFullscreen = () => {
        popupMessageHandler.sendInternalMessage(
            InternalMessageType.OpenFullscreen,
            `?navTo=${location.pathname}&state=${JSON.stringify(location.state || {})}`
        );
        window.close();
    };

    return (
        <>
            <div
                className={clsx('main-header__ledger', { connected, hidden: hideConnection })}
                onClick={handleClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') handleClick();
                }}
            >
                <div className="main-header__ledger_icon">
                    {showOverlay || showDeviceModal ? <LedgerOnIcon /> : <LedgerOffIcon />}
                </div>
            </div>
            <LedgerConnectOverlay
                open={showOverlay}
                onClose={() => setShowOverlay(false)}
                onConnect={handleOpenFullscreen}
            />
            <LedgerDeviceModal
                open={showDeviceModal}
                onClose={() => setShowDeviceModal(false)}
                onConnect={async () => {
                    try {
                        // Show Chrome's device selection dialog
                        const info = await connectLedgerDevice();
                        setDeviceInfo(info);
                        setShowDeviceModal(false);
                        setShowConfirmModal(true);
                    } catch (error) {
                        // Keep modal open on error so user can try again
                        console.error('Ledger connection error:', error);
                    }
                }}
            />
            <LedgerDeviceConfirmModal
                open={showConfirmModal}
                onClose={() => {
                    setShowConfirmModal(false);
                    if (!connected) {
                        setDeviceInfo(null);
                        setConnectionStatus('pending');
                    }
                }}
                deviceName={deviceInfo?.deviceName || 'Ledger Device'}
                connectionStatus={connectionStatus}
                onConnect={async () => {
                    try {
                        // Check if device is still physically connected
                        const success = await isLedgerConnected();

                        if (success) {
                            setConnectionStatus('success');
                            setConnected(true);
                            addToast(<LedgerConnectionSuccess />);
                        } else {
                            setConnectionStatus('failed');
                            addToast(<LedgerConnectionFailed />);
                        }
                    } catch (error) {
                        console.error('Ledger connection error:', error);
                        setConnectionStatus('failed');
                        addToast(<LedgerConnectionFailed />);
                    }
                }}
                onDisconnect={async () => {
                    await disconnectLedgerDevice();
                    setConnected(false);
                    setShowConfirmModal(false);
                    setDeviceInfo(null);
                    setConnectionStatus('pending');
                }}
            />
        </>
    );
}

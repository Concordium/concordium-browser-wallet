import React, { useEffect, useRef, useState } from 'react';
import Button from '@popup/popupX/shared/Button';
import { useNavigate } from 'react-router-dom';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import { useTranslation } from 'react-i18next';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';

type LedgerDeviceDetails = {
    productName?: string;
};

export default function DeviceConnection() {
    const { t } = useTranslation('x', { keyPrefix: 'onboarding.deviceConnection' });
    const nav = useNavigate();
    const navToNext = () => nav(absoluteRoutes.onboarding.setupPassword.createOrRestore.comparePublicKey.path);

    const [ledgerDetails, setLedgerDetails] = useState<LedgerDeviceDetails | null>(null);
    const [status, setStatus] = useState<string>('');
    const [bgColor, setBgColor] = useState<string>('');
    const [textColor, setTextColor] = useState<string>('');
    const listenerAttached = useRef(false);

    const disconnectLedgerDevice = () => {
        window.postMessage({ type: 'DISCONNECT_LEDGER_DEVICE' }, '*');
    };

    const handleLedgerMessage = (event: MessageEvent) => {
        const { type, success, details, error } = event.data;

        if (type === 'LEDGER_CONNECTED' && success) {
            setLedgerDetails(details);
            setBgColor('#0d261c');
            setTextColor('#24d4ab');
            setStatus(`Ledger ${details.productName || 'Ledger Device'} is connected`);
            disconnectLedgerDevice();
        } else if (type === 'LEDGER_ERROR') {
            setLedgerDetails(null);
            setBgColor('#2B171B');
            setTextColor('#D62E4C');
            setStatus(`${error}`);
        }
    };

    const connectLedgerDevice = () => {
        window.postMessage({ type: 'REQUEST_LEDGER_DEVICE' }, '*');
        if (!listenerAttached.current) {
            window.addEventListener('message', handleLedgerMessage);
            listenerAttached.current = true;
        }
    };

    const getLedgerStatus = () => {
        window.postMessage({ type: 'GET_LEDGER_STATUS' }, '*');
        if (!listenerAttached.current) {
            window.addEventListener('message', handleLedgerMessage);
            listenerAttached.current = true;
        }
    };

    useEffect(() => {
        getLedgerStatus();
        return () => {
            window.removeEventListener('message', handleLedgerMessage);
            listenerAttached.current = false;
        };
    }, []);

    return (
        <Page className="id-cards-info">
            <Page.Top heading={t('ids')} />
            <Page.Main>
                <Text.Capture>{t('idDescription')}</Text.Capture>
            </Page.Main>
            <Page.Footer>
                {status && (
                    <p
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            position: 'absolute',
                            width: '327px',
                            height: 115,
                            top: 438,
                            backgroundColor: bgColor,
                            border: '1px solid rgb(78, 79, 78)',
                            borderRadius: '24px',
                            color: textColor,
                            zIndex: '-1',
                            paddingTop: '15px',
                            paddingLeft: '5px',
                            fontStyle: 'bold',
                        }}
                    >
                        {status}
                    </p>
                )}
                {!ledgerDetails && (
                    <Button.Main type="button" label={t('connectDevice')} onClick={connectLedgerDevice} />
                )}
                {ledgerDetails && <Button.Main type="button" label={t('continue')} onClick={navToNext} />}
            </Page.Footer>
        </Page>
    );
}

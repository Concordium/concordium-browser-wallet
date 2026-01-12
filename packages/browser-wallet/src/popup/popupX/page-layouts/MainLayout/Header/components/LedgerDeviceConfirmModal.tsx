import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@popup/shared/Modal';
import Button from '@popup/popupX/shared/Button';
import Text from '@popup/popupX/shared/Text';

type ConnectionStatus = 'pending' | 'success' | 'failed';

interface Props {
    open: boolean;
    onClose: () => void;
    onConnect: () => void;
    onDisconnect?: () => void;
    deviceName: string;
    connectionStatus: ConnectionStatus;
}

export default function LedgerDeviceConfirmModal({
    open,
    onClose,
    onConnect,
    onDisconnect,
    deviceName,
    connectionStatus,
}: Props) {
    const { t } = useTranslation('x', { keyPrefix: 'header.ledger.deviceModal' });

    const renderContent = () => {
        switch (connectionStatus) {
            case 'success':
                return (
                    <>
                        <div className="success-box">
                            <Text.MainRegular>
                                {t('deviceConnected')}
                                <br />
                                <strong>{deviceName}</strong>
                            </Text.MainRegular>
                        </div>
                        <Button.Main
                            onClick={onDisconnect || onClose}
                            label={t('disconnectButton')}
                            className="button__override"
                        />
                    </>
                );

            case 'failed':
                return (
                    <>
                        <Text.MainRegular className="m-b-20">
                            {t('faqText')}
                            <a
                                href="https://docs.concordium.com/en/mainnet/docs/browser-wallet/browser-wallet-faq.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'white', textDecoration: 'underline' }}
                            >
                                FAQ page
                            </a>
                            .
                        </Text.MainRegular>
                        <Button.Main onClick={onConnect} label={t('cta')} className="button__override" />
                    </>
                );

            case 'pending':
            default:
                return (
                    <>
                        <div className="success-box">
                            <Text.MainRegular>
                                <strong>{deviceName}</strong> {t('readyForConnection')}
                            </Text.MainRegular>
                        </div>
                        <Button.Main onClick={onConnect} label={t('cta')} className="button__override" />
                    </>
                );
        }
    };

    return (
        <Modal open={open} onClose={onClose} middle className="ledger-connect-modal">
            <div className="ledger-connect-overlay">
                <Text.HeadingLarge className="m-b-20">{t('title')}</Text.HeadingLarge>
                {renderContent()}
            </div>
        </Modal>
    );
}

import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@popup/shared/Modal';
import Button from '@popup/popupX/shared/Button';
import Text from '@popup/popupX/shared/Text';

interface Props {
    open: boolean;
    onClose: () => void;
    onConnect: () => void;
}

export default function LedgerDeviceModal({ open, onClose, onConnect }: Props) {
    const { t } = useTranslation('x', { keyPrefix: 'header.ledger.deviceModal' });

    return (
        <Modal open={open} onClose={onClose} middle className="ledger-connect-modal">
            <div className="ledger-connect-overlay">
                <Text.HeadingLarge className="m-b-20">{t('title')}</Text.HeadingLarge>

                <div className="dialog-box">
                    <Text.MainRegular>
                        {t('ledgerConnection')}
                        <a
                            className="faq-link"
                            href="https://docs.concordium.com/en/mainnet/docs/browser-wallet/browser-wallet-faq.html"
                        >
                            FAQ page
                        </a>
                        .
                    </Text.MainRegular>
                </div>
                <Button.Main onClick={onConnect} label={t('cta')} className="button__override" />
            </div>
        </Modal>
    );
}

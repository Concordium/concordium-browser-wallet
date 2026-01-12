/* eslint-disable react/no-danger */
import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@popup/shared/Modal';
import { isFullscreenWindow } from '@popup/shared/window-helpers';
import Button from '@popup/popupX/shared/Button';
import Text from '@popup/popupX/shared/Text';

interface Props {
    open: boolean;
    onClose: () => void;
    onConnect: () => void;
}

export default function LedgerConnectOverlay({ open, onClose, onConnect }: Props) {
    const { t } = useTranslation('x', { keyPrefix: 'header.ledger.deviceModal' });

    return (
        <Modal open={open} onClose={onClose} middle className="ledger-connect-modal">
            <div className="ledger-connect-overlay">
                <Text.HeadingLarge className="m-b-20">{t('title')}</Text.HeadingLarge>
                <div className="warning-box">
                    <Text.MainRegular>
                        <span dangerouslySetInnerHTML={{ __html: t('fullScreenModal') }} />
                    </Text.MainRegular>
                </div>
                <Button.Main onClick={onConnect} label={t('cta')} disabled={!isFullscreenWindow} />
            </div>
        </Modal>
    );
}

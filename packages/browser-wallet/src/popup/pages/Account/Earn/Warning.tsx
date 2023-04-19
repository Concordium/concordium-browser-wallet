import Modal from '@popup/shared/Modal';
import React from 'react';
import Button from '@popup/shared/Button';
import { useTranslation } from 'react-i18next';

export enum AmountWarning {
    None,
    AboveThreshold,
    Decrease,
}

interface Props {
    onContinue: () => void;
    onCancel: () => void;
    thresholdWarning: string;
    decreaseWarning: string;
    cancelText: string;
    warningState: AmountWarning;
}

export function WarningModal({
    onCancel,
    onContinue,
    thresholdWarning,
    decreaseWarning,
    cancelText,
    warningState,
}: Props) {
    const { t } = useTranslation('account');
    const { t: tShared } = useTranslation('shared');

    return (
        <Modal open={warningState !== AmountWarning.None} onClose={onCancel}>
            <div>
                {warningState === AmountWarning.AboveThreshold && (
                    <>
                        <h3 className="m-t-0">{t('warning')}</h3>
                        <p className="white-space-break ">{thresholdWarning}</p>
                    </>
                )}
                {warningState === AmountWarning.Decrease && (
                    <>
                        <h3 className="m-t-0">{t('important')}</h3>
                        <p className="white-space-break ">{decreaseWarning}</p>
                    </>
                )}
                <Button className="m-t-10" width="wide" onClick={onContinue}>
                    {tShared('continue')}
                </Button>
                <Button className="m-t-10" onClick={onCancel}>
                    {cancelText}
                </Button>
            </div>
        </Modal>
    );
}

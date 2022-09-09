import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '@popup/shared/Button';

export default function RecoveryIntro() {
    const { t } = useTranslation('recovery');
    const nav = useNavigate();

    return (
        <div className="recovery__intro">
            <pre className="recovery__intro__description">{t('description')}</pre>
            <Button width="wide" onClick={() => nav('main')} className="recovery__intro__button">
                {t('restore')}
            </Button>
        </div>
    );
}

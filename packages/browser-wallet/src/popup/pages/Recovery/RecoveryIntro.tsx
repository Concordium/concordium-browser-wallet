import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '@popup/shared/Button';
import { absoluteRoutes } from '@popup/constants/routes';

export default function RecoveryIntro() {
    const { t } = useTranslation('recovery');
    const nav = useNavigate();

    return (
        <div className="recovery__intro">
            <pre className="recovery__intro__description">{t('intro.description')}</pre>
            <Button width="wide" onClick={() => nav(absoluteRoutes.recovery.path)} className="recovery__intro__button">
                {t('restore')}
            </Button>
        </div>
    );
}

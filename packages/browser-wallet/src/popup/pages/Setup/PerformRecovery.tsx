import React from 'react';
import PageHeader from '@popup/shared/PageHeader';
import RecoveryMain from '@popup/pages/Recovery/RecoveryMain';
import { useTranslation } from 'react-i18next';

export default function PerformRecovery() {
    const { t } = useTranslation('setup');

    return (
        <>
            <PageHeader>{t('performRecovery.title')}</PageHeader>
            <RecoveryMain className="onboarding-setup__page-with-header" />
        </>
    );
}

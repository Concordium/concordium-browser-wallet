import React from 'react';
import { useNavigate } from 'react-router-dom';
import { absoluteRoutes } from '@popup/constants/routes';
import PageHeader from '@popup/shared/PageHeader';
import Button from '@popup/shared/Button';
import { useTranslation } from 'react-i18next';
import { setupRoutes } from './routes';

export default function CreateOrRestore() {
    const navigate = useNavigate();
    const { t } = useTranslation('setup');

    return (
        <>
            <PageHeader>Create or restore</PageHeader>
            <div className="page-with-header">
                <div className="page-with-header__description">{t('createRestore.description')}</div>
                <Button
                    className="page-with-header__create-restore-button"
                    width="wide"
                    onClick={() => navigate(`${absoluteRoutes.setup.path}/${setupRoutes.createNew}`)}
                >
                    {t('createRestore.create')}
                </Button>
                <Button
                    className="page-with-header__create-restore-button"
                    width="wide"
                    onClick={() => navigate(`${absoluteRoutes.setup.path}/${setupRoutes.restore}`)}
                >
                    {t('createRestore.restore')}
                </Button>
            </div>
        </>
    );
}

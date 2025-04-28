import React from 'react';
import { absoluteRoutes } from '@popup/constants/routes';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AcceptTerms from './AcceptTerms';

export default function TermsAndConditions() {
    const { t } = useTranslation('termsAndConditions');
    const navigate = useNavigate();
    return (
        <AcceptTerms onSubmit={() => navigate(absoluteRoutes.home.account.path)}>
            <p>{t('description')}</p>
        </AcceptTerms>
    );
}

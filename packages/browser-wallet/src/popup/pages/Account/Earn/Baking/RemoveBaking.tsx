import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Carousel from '@popup/shared/Carousel';
import { useTranslation } from 'react-i18next';
import { absoluteRoutes } from '@popup/constants/routes';
import { AccountTransactionType, CcdAmount } from '@concordium/web-sdk';
import { accountRoutes } from '../../routes';
import { ConfirmGenericTransferState } from '../../ConfirmGenericTransfer';
import IntroPage from '../IntroPage';

export default function RemoveBaking() {
    const nav = useNavigate();
    const { t } = useTranslation('account', { keyPrefix: 'baking.removeIntro' });
    const { pathname } = useLocation();

    const goToConfirm = () => {
        const confirmTransferState: ConfirmGenericTransferState = {
            payload: {
                stake: new CcdAmount(0n),
            },
            type: AccountTransactionType.ConfigureBaker,
        };
        nav(pathname, { replace: true, state: true }); // Override current router entry with stateful version
        nav(`${absoluteRoutes.home.account.path}/${accountRoutes.confirmTransfer}`, {
            state: confirmTransferState,
        });
    };

    return (
        <Carousel withBackButton className="earn-carousel" onContinue={goToConfirm}>
            <IntroPage title={t('1.title')}>{t('1.body')}</IntroPage>
        </Carousel>
    );
}

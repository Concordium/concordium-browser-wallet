import React, { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';

import Carousel from '@popup/shared/Carousel';
import { useTranslation } from 'react-i18next';
import Modal from '@popup/shared/Modal';
import { ensureDefined } from '@shared/utils/basic-helpers';
import { useSelectedAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import ConfigureDelegationFlow from './ConfigureDelegationFlow';
import { getExistingDelegationValues } from './utils';
import IntroPage from '../IntroPage';

const routes = {
    configure: 'configure',
};

function Intro() {
    const nav = useNavigate();
    const { t } = useTranslation('account', { keyPrefix: 'delegate.updateIntro' });
    const accountInfo = ensureDefined(useSelectedAccountInfo(), 'Assumed account info to be available');

    const goToRegister = () => {
        nav(routes.configure, { state: getExistingDelegationValues(accountInfo) });
    };

    return (
        <Carousel withBackButton className="earn-carousel" onContinue={goToRegister}>
            <IntroPage title={t('1.title')}>{t('1.body')}</IntroPage>
            <IntroPage title={t('2.title')}>{t('2.body')}</IntroPage>
            <IntroPage title={t('3.title')}>{t('3.body')}</IntroPage>
        </Carousel>
    );
}

export default function RegisterDelegation() {
    const { t } = useTranslation('account', { keyPrefix: 'delegate.update' });
    const [noChanges, setNoChanges] = useState<boolean>(false);

    return (
        <>
            <Modal onClose={() => setNoChanges(false)} open={noChanges}>
                <div className="network-settings-page__pending-identity">
                    <p>{t('noChanges')}</p>
                </div>
            </Modal>
            <Routes>
                <Route index element={<Intro />} />
                <Route
                    path={`${routes.configure}/*`}
                    element={<ConfigureDelegationFlow title={t('title')} onConvertError={() => setNoChanges(true)} />}
                />
            </Routes>
        </>
    );
}

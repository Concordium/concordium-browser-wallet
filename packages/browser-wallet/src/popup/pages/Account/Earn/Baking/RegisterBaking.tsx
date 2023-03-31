import React, { PropsWithChildren } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';

import Carousel from '@popup/shared/Carousel';
import { useTranslation } from 'react-i18next';
import { ConfigureBakerFull } from './ConfigureBakerFlow';

const routes = {
    configure: 'configure',
};

type IntroPageProps = PropsWithChildren<{
    title: string;
}>;

function IntroPage({ title, children }: IntroPageProps) {
    return (
        <>
            <h3 className="text-center m-t-0">{title}</h3>
            {children}
        </>
    );
}

function Intro() {
    const nav = useNavigate();
    const { t } = useTranslation('account', { keyPrefix: 'baking.registerIntro' });

    const goToRegister = () => {
        nav(routes.configure);
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
    const { t } = useTranslation('account', { keyPrefix: 'baking.register' });

    return (
        <Routes>
            <Route index element={<Intro />} />
            <Route path={`${routes.configure}/*`} element={<ConfigureBakerFull title={t('title')} />} />
        </Routes>
    );
}

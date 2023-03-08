import React, { PropsWithChildren } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';

import Carousel from '@popup/shared/Carousel';
import { Trans, useTranslation } from 'react-i18next';
import ExternalLink from '@popup/shared/ExternalLink';
import ConfigureDelegationFlow from './ConfigureDelegationFlow';

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
    const { t } = useTranslation('account', { keyPrefix: 'delegate.registerIntro' });

    const goToRegister = () => {
        nav(routes.configure);
    };

    return (
        <Carousel className="earn-carousel" onContinue={goToRegister}>
            <IntroPage title={t('1.title')}>
                <Trans
                    ns="account"
                    i18nKey="delegate.registerIntro.1.body"
                    components={{
                        1: (
                            <ExternalLink path="https://developer.concordium.software/en/mainnet/net/concepts/concepts-delegation.html" />
                        ),
                    }}
                />
            </IntroPage>
            <IntroPage title={t('2.title')}>
                <Trans
                    ns="account"
                    i18nKey="delegate.registerIntro.2.body"
                    components={{
                        1: (
                            <ExternalLink path="https://developer.concordium.software/en/mainnet/net/concepts/concepts-delegation.html" />
                        ),
                        2: <ul />,
                        3: <li />,
                    }}
                />
            </IntroPage>
            <IntroPage title={t('3.title')}>
                <Trans
                    ns="account"
                    i18nKey="delegate.registerIntro.3.body"
                    components={{
                        1: (
                            <ExternalLink path="https://developer.concordium.software/en/mainnet/net/concepts/concepts-delegation.html#pools-and-rewards" />
                        ),
                    }}
                />
            </IntroPage>
            <IntroPage title={t('4.title')}>{t('4.body')}</IntroPage>
            <IntroPage title={t('5.title')}>
                <Trans
                    ns="account"
                    i18nKey="delegate.registerIntro.5.body"
                    components={{
                        1: (
                            <ExternalLink path="https://developer.concordium.software/en/mainnet/net/concepts/concepts-delegation.html" />
                        ),
                    }}
                />
            </IntroPage>
            <IntroPage title={t('6.title')}>{t('6.body')}</IntroPage>
            <IntroPage title={t('7.title')}>{t('7.body')}</IntroPage>
        </Carousel>
    );
}

export default function RegisterDelegation() {
    const { t } = useTranslation('account', { keyPrefix: 'delegate.register' });

    return (
        <Routes>
            <Route index element={<Intro />} />
            <Route path={`${routes.configure}/*`} element={<ConfigureDelegationFlow title={t('title')} />} />
        </Routes>
    );
}

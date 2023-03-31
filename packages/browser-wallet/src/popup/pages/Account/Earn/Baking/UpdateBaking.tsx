import React, { ReactNode, useState } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';

import Carousel from '@popup/shared/Carousel';
import { Trans, useTranslation } from 'react-i18next';
import Modal from '@popup/shared/Modal';
import { ensureDefined } from '@shared/utils/basic-helpers';
import { useSelectedAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import NavList from '@popup/shared/NavList';
import { getExistingBakerValues } from './utils';
import IntroPage from '../IntroPage';
import { ConfigureBakerKeys, ConfigureBakerPool, ConfigureBakerStake } from './ConfigureBakerFlow';

const routes = {
    configure: 'configure',
    configureIntro: 'intro-configure',
    stake: 'stake',
    stakeIntro: 'intro-stake',
    keys: 'keys',
    keysIntro: 'intro-keys',
    pool: 'pool',
    poolIntro: 'intro-pool',
};

interface IntroProps {
    route: string;
    children: ReactNode | ReactNode[];
}

/**
 * Common parts for the different update flows
 */
function Intro({ route, children }: IntroProps) {
    const nav = useNavigate();
    const accountInfo = ensureDefined(useSelectedAccountInfo(), 'Assumed account info to be available');

    const goToRegister = () => {
        nav(`../${route}`, { state: getExistingBakerValues(accountInfo) });
    };

    return (
        <Carousel withBackButton className="earn-carousel" onContinue={goToRegister}>
            {children}
        </Carousel>
    );
}

function StakeIntro() {
    const { t } = useTranslation('account', { keyPrefix: 'baking.updateIntro' });
    return (
        <Intro route={routes.stake}>
            <IntroPage title={t('2.title')}>{t('2.body')}</IntroPage>
        </Intro>
    );
}

function PoolIntro() {
    const { t } = useTranslation('account', { keyPrefix: 'baking.updateIntro' });
    return (
        <Intro route={routes.pool}>
            <IntroPage title={t('3.title')}>
                <Trans>{t('3.body')}</Trans>
            </IntroPage>
            <IntroPage title={t('4.title')}>{t('4.body')}</IntroPage>
        </Intro>
    );
}

function KeysIntro() {
    const { t } = useTranslation('account', { keyPrefix: 'baking.updateIntro' });
    return (
        <Intro route={routes.keys}>
            <IntroPage title={t('5.title')}>{t('5.body')}</IntroPage>
        </Intro>
    );
}

function Menu() {
    const { t } = useTranslation('account', { keyPrefix: 'baking.update' });

    return (
        <NavList className="baking-update-menu">
            <Link className="baking-update-menu__link" to={routes.stakeIntro}>
                {t('title.stake')}
            </Link>
            <Link className="baking-update-menu__link" to={routes.poolIntro}>
                {t('title.pool')}
            </Link>
            <Link className="baking-update-menu__link" to={routes.keysIntro}>
                {t('title.keys')}
            </Link>
        </NavList>
    );
}

export default function UpdateBaking() {
    const { t } = useTranslation('account', { keyPrefix: 'baking.update' });
    const [noChanges, setNoChanges] = useState<boolean>(false);

    return (
        <>
            <Modal onClose={() => setNoChanges(false)} open={noChanges}>
                <div className="network-settings-page__pending-identity">
                    <p>{t('noChanges')}</p>
                </div>
            </Modal>
            <Routes>
                <Route
                    path={`${routes.stake}/*`}
                    element={<ConfigureBakerStake title={t('title.stake')} onConvertError={() => setNoChanges(true)} />}
                />
                <Route
                    path={`${routes.pool}/*`}
                    element={<ConfigureBakerPool title={t('title.pool')} onConvertError={() => setNoChanges(true)} />}
                />
                <Route
                    path={`${routes.keys}/*`}
                    element={<ConfigureBakerKeys title={t('title.keys')} onConvertError={() => setNoChanges(true)} />}
                />
                <Route path={routes.stakeIntro} element={<StakeIntro />} />
                <Route path={routes.keysIntro} element={<KeysIntro />} />
                <Route path={routes.poolIntro} element={<PoolIntro />} />
                <Route index element={<Menu />} />
            </Routes>
        </>
    );
}

import React from 'react';
import ArrowRight from '@assets/svgX/arrow-right.svg';
import Info from '@assets/svgX/info.svg';
import Page from '@popup/popupX/shared/Page';
import { useBlockChainParameters } from '@popup/shared/BlockChainParametersProvider';
import { cpBakingThreshold } from '@shared/utils/chain-parameters-helpers';
import { displayAsCcd } from 'wallet-common-helpers';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { absoluteRoutes } from '@popup/popupX/constants/routes';

export default function EarningRewards() {
    const { t } = useTranslation('x', { keyPrefix: 'earn.root' });
    const cp = useBlockChainParameters();

    if (cp === undefined) {
        return null;
    }

    const bakingThreshold = cpBakingThreshold(cp);

    return (
        <Page className="earn-container">
            <Page.Top heading="Earning Rewards" />
            <Page.Main>
                <div className="earn__card">
                    <span className="text__main">{t('validatorTitle')}</span>
                    <span className="capture__main_small">
                        {t('validatorDescription', { amount: displayAsCcd(bakingThreshold, false) })}
                    </span>
                    <Link to={absoluteRoutes.settings.earn.baker.intro.path}>
                        <div className="earn__card_continue">
                            <span className="label__regular">{t('validatorAction')}</span>
                            <ArrowRight />
                        </div>
                    </Link>
                </div>
                <div className="earn__card">
                    <span className="text__main">{t('delegationTitle')}</span>
                    <span className="capture__main_small">{t('delegationDescription')}</span>
                    <Link to={absoluteRoutes.settings.earn.delegator.intro.path}>
                        <div className="earn__card_continue">
                            <span className="label__regular">{t('delegationAction')}</span>
                            <ArrowRight />
                        </div>
                    </Link>
                </div>
                <div className="earn__info">
                    <div className="earn__info_icon">
                        <Info />
                    </div>
                    <span className="capture__main_small">{t('note')}</span>
                </div>
            </Page.Main>
        </Page>
    );
}

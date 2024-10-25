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
import Text from '@popup/popupX/shared/Text';

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
                    <Text.Main>{t('validatorTitle')}</Text.Main>
                    <Text.Capture>
                        {t('validatorDescription', { amount: displayAsCcd(bakingThreshold, false) })}
                    </Text.Capture>
                    <Link to={absoluteRoutes.settings.earn.validator.intro.path}>
                        <div className="earn__card_continue">
                            <span className="label__regular">{t('validatorAction')}</span>
                            <ArrowRight />
                        </div>
                    </Link>
                </div>
                <div className="earn__card">
                    <Text.Main>{t('delegationTitle')}</Text.Main>
                    <Text.Capture>{t('delegationDescription')}</Text.Capture>
                    <Link to={absoluteRoutes.settings.earn.delegator.register.path}>
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
                    <Text.Capture>{t('note')}</Text.Capture>
                </div>
            </Page.Main>
        </Page>
    );
}

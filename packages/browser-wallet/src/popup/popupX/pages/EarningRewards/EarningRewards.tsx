import React from 'react';
import ArrowRight from '@assets/svgX/arrow-right.svg';
import Info from '@assets/svgX/info.svg';
import Page from '@popup/popupX/shared/Page';
import { useBlockChainParameters } from '@popup/shared/BlockChainParametersProvider';
import { cpBakingThreshold } from '@shared/utils/chain-parameters-helpers';
import { displayAsCcd } from 'wallet-common-helpers';
import { useTranslation } from 'react-i18next';
import { Link, Navigate } from 'react-router-dom';
import { absoluteRoutes, relativeRoutes } from '@popup/popupX/constants/routes';
import Text from '@popup/popupX/shared/Text';
import { useSelectedAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import { AccountInfoType } from '@concordium/web-sdk';
import Card from '@popup/popupX/shared/Card';
import AccountCooldowns from './AccountCooldowns';

export default function EarningRewards() {
    const { t } = useTranslation('x', { keyPrefix: 'earn.root' });
    const cp = useBlockChainParameters();
    const accountInfo = useSelectedAccountInfo();

    switch (accountInfo?.type) {
        case AccountInfoType.Delegator:
            return <Navigate to={relativeRoutes.settings.earn.delegator.path} />;
        case AccountInfoType.Baker:
            return <Navigate to={relativeRoutes.settings.earn.validator.path} />;
        default:
            break;
    }

    if (cp === undefined) {
        return null;
    }

    const bakingThreshold = cpBakingThreshold(cp);

    return (
        <Page className="earn-container">
            <Page.Top heading="Earning Rewards" />
            <Page.Main>
                {accountInfo !== undefined && (
                    <AccountCooldowns className="earn__cooldowns" cooldowns={accountInfo.accountCooldowns} />
                )}
                <Card type="grey" className="earn__card">
                    <Text.Main>{t('validatorTitle')}</Text.Main>
                    <Text.Capture>
                        {t('validatorDescription', { amount: displayAsCcd(bakingThreshold, false) })}
                    </Text.Capture>
                    <Link to={absoluteRoutes.settings.earn.validator.register.path}>
                        <div className="earn__card_continue">
                            <Text.LabelRegular>{t('validatorAction')}</Text.LabelRegular>
                            <ArrowRight />
                        </div>
                    </Link>
                </Card>
                <Card type="grey" className="earn__card">
                    <Text.Main>{t('delegationTitle')}</Text.Main>
                    <Text.Capture>{t('delegationDescription')}</Text.Capture>
                    <Link to={absoluteRoutes.settings.earn.delegator.register.path}>
                        <div className="earn__card_continue">
                            <Text.LabelRegular>{t('delegationAction')}</Text.LabelRegular>
                            <ArrowRight />
                        </div>
                    </Link>
                </Card>
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

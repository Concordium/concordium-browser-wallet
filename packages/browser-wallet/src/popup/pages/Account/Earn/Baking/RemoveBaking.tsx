import React from 'react';
import { AccountTransactionType } from '@concordium/web-sdk';
import { useTranslation } from 'react-i18next';
import { useBlockChainParametersAboveV0 } from '@popup/shared/BlockChainParametersProvider';
import { secondsToDaysRoundedDown } from '@shared/utils/time-helpers';
import IntroPage from '../IntroPage';
import RemoveCarousel from '../RemoveCarousel';

export default function RemoveBaking() {
    const { t } = useTranslation('account', { keyPrefix: 'baking' });
    const chainParameters = useBlockChainParametersAboveV0();
    return (
        <RemoveCarousel
            type={AccountTransactionType.ConfigureBaker}
            warningMessage={t('remove.notice', {
                cooldownPeriod: secondsToDaysRoundedDown(chainParameters?.poolOwnerCooldown),
            })}
        >
            <IntroPage title={t('removeIntro.1.title')}>{t('removeIntro.1.body')}</IntroPage>
        </RemoveCarousel>
    );
}

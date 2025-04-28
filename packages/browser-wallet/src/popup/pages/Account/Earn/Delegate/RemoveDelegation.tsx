import React from 'react';
import { AccountTransactionType } from '@concordium/web-sdk';
import { useTranslation } from 'react-i18next';
import { secondsToDaysRoundedDown } from '@shared/utils/time-helpers';
import { useBlockChainParametersAboveV0 } from '@popup/shared/BlockChainParametersProvider';
import IntroPage from '../IntroPage';
import RemoveCarousel from '../RemoveCarousel';

export default function RemoveDelegaton() {
    const { t } = useTranslation('account', { keyPrefix: 'delegate' });
    const chainParameters = useBlockChainParametersAboveV0();
    return (
        <RemoveCarousel
            type={AccountTransactionType.ConfigureDelegation}
            warningMessage={t('remove.notice', {
                cooldownPeriod: secondsToDaysRoundedDown(chainParameters?.delegatorCooldown),
            })}
        >
            <IntroPage title={t('removeIntro.1.title')}>{t('removeIntro.1.body')}</IntroPage>
            <IntroPage title={t('removeIntro.2.title')}>{t('removeIntro.2.body')}</IntroPage>
        </RemoveCarousel>
    );
}

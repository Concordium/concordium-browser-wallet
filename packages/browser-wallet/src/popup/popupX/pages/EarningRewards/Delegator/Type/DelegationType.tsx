import React from 'react';
import Radio from '@popup/popupX/shared/Form/Radios';
import Button from '@popup/popupX/shared/Button';
import { Trans, useTranslation } from 'react-i18next';
import Page from '@popup/popupX/shared/Page';
import ExternalLink from '@popup/popupX/shared/ExternalLink';

export default function DelegationType() {
    const { t } = useTranslation('x', { keyPrefix: 'earn.delegator.target' });
    return (
        <Page className="delegation-type-container">
            <Page.Top heading={t('title')} />
            <span className="capture__main_small">{t('description')}</span>
            <div className="delegation-type__select-form">
                <Radio id="validator" label={t('radioValidatorLabel')} name="radio" />
                <Radio id="passive" label={t('radioPassiveLabel')} name="radio" />
            </div>
            <span className="capture__main_small">
                <Trans
                    t={t}
                    i18nKey="passiveDelegationDescription"
                    components={{
                        '1': (
                            <ExternalLink path="https://developer.concordium.software/en/mainnet/net/concepts/concepts-delegation.html" />
                        ),
                    }}
                />
            </span>
            <Button.Main label={t('buttonContinue')} />
        </Page>
    );
}

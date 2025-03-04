import React from 'react';
import { useNavigate } from 'react-router-dom';
import Page from '@popup/popupX/shared/Page';
import { Trans, useTranslation } from 'react-i18next';
import Text from '@popup/popupX/shared/Text';
import Button from '@popup/popupX/shared/Button';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import { ValidationResultLocationState } from '@popup/popupX/pages/EarningRewards/Validator/Result';

const SUSPEND_STATE: ValidationResultLocationState = {
    type: 'suspend',
    payload: { suspended: true },
};

export default function SelfSuspend() {
    const { t } = useTranslation('x', { keyPrefix: 'earn.validator.selfSuspend' });
    const nav = useNavigate();
    return (
        <Page className="self-suspend">
            <Page.Top heading={t('title')} />
            <Page.Main>
                <Text.Capture>
                    <Trans
                        t={t}
                        i18nKey="body"
                        components={{
                            ul: <ul />,
                            li: <li />,
                        }}
                    />
                </Text.Capture>
            </Page.Main>
            <Page.Footer>
                <Button.Main
                    className="secondary"
                    label={t('continue')}
                    onClick={() => nav(absoluteRoutes.settings.earn.validator.submit.path, { state: SUSPEND_STATE })}
                />
                <Button.Main label={t('back')} onClick={() => nav(absoluteRoutes.settings.earn.path)} />
            </Page.Footer>
        </Page>
    );
}

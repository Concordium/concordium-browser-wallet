import React from 'react';
import Carousel from '@popup/popupX/shared/Carousel';
import { useNavigate } from 'react-router-dom';
import Page from '@popup/popupX/shared/Page';
import { Trans, useTranslation } from 'react-i18next';
import ExternalLink from '@popup/popupX/shared/ExternalLink';
import { absoluteRoutes } from '@popup/popupX/constants/routes';

export default function DelegatorIntro() {
    const nav = useNavigate();
    const { t } = useTranslation('x', { keyPrefix: 'earn.delegator.intro' });
    return (
        <Page className="delegator-intro-container">
            <Carousel
                onDone={() => nav(absoluteRoutes.settings.earn.delegator.register.configure.path, { replace: true })}
            >
                <span className="capture__main_small">
                    <Page.Top heading={t('1.title')} />
                    <Trans
                        t={t}
                        i18nKey="1.body"
                        components={{
                            '1': (
                                <ExternalLink path="https://developer.concordium.software/en/mainnet/net/concepts/concepts-delegation.html" />
                            ),
                        }}
                    />
                </span>
                <span className="capture__main_small">
                    <Page.Top heading={t('2.title')} />
                    <Trans
                        t={t}
                        i18nKey="2.body"
                        components={{
                            ul: <ul />,
                            li: <li />,
                            '1': (
                                <ExternalLink path="https://developer.concordium.software/en/mainnet/net/concepts/concepts-delegation.html" />
                            ),
                        }}
                    />
                </span>
                <span className="capture__main_small">
                    <Page.Top heading={t('3.title')} />
                    <Trans
                        t={t}
                        i18nKey="3.body"
                        components={{
                            ul: <ul />,
                            li: <li />,
                            '1': (
                                <ExternalLink path="https://developer.concordium.software/en/mainnet/net/concepts/concepts-delegation.html" />
                            ),
                        }}
                    />
                </span>
                <span className="capture__main_small">
                    <Page.Top heading={t('4.title')} />
                    <Trans t={t} i18nKey="4.body" />
                </span>
                <span className="capture__main_small">
                    <Page.Top heading={t('5.title')} />
                    <Trans
                        t={t}
                        i18nKey="5.body"
                        components={{
                            '1': (
                                <ExternalLink path="https://developer.concordium.software/en/mainnet/net/concepts/concepts-delegation.html" />
                            ),
                        }}
                    />
                </span>
                <span className="capture__main_small">
                    <Page.Top heading={t('6.title')} />
                    <Trans t={t} i18nKey="6.body" />
                </span>
            </Carousel>
        </Page>
    );
}

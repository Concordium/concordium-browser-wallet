import { useTranslation } from 'react-i18next';
import Page from '@popup/popupX/shared/Page';
import Button from '@popup/popupX/shared/Button';
import ArrowSquare from '@assets/svgX/arrow-square-out.svg';
import React from 'react';
import Card from '@popup/popupX/shared/Card';
import Text from '@popup/popupX/shared/Text';
import { getVersionName } from '@shared/utils/environment-helpers';
import { useAtomValue } from 'jotai';
import { acceptedTermsAtom } from '@popup/store/settings';
import urls from '@shared/constants/url';

// Start saving the URL for the T&C we get from the wallet proxy,
// and use that in the About page link.
function useGetTermsUrl() {
    const { loading: loadingAcceptedTerms, value: acceptedTerms } = useAtomValue(acceptedTermsAtom);

    if (loadingAcceptedTerms) {
        return '';
    }

    return acceptedTerms?.url || urls.termsAndConditions;
}

export default function About() {
    const { t } = useTranslation('x', { keyPrefix: 'aboutPage' });
    const termsUrl = useGetTermsUrl();

    return (
        <Page className="about-x">
            <Page.Top heading={t('about')} />
            <Page.Main>
                <Card>
                    <Card.Row>
                        <Text.MainMedium>{t('documentation')}</Text.MainMedium>
                        <Text.ExternalLink path={urls.documentationWebsite}>
                            <Button.Base as="span" className="button__icon transparent">
                                <ArrowSquare />
                            </Button.Base>
                        </Text.ExternalLink>
                    </Card.Row>
                    <Card.Row>
                        <Text.MainMedium>{t('forum')}</Text.MainMedium>
                        <Text.ExternalLink path={urls.supportWebsite}>
                            <Button.Base as="span" className="button__icon transparent">
                                <ArrowSquare />
                            </Button.Base>
                        </Text.ExternalLink>
                    </Card.Row>
                    <Card.Row>
                        <Text.MainMedium>{t('website')}</Text.MainMedium>
                        <Text.ExternalLink path={urls.website}>
                            <Button.Base as="span" className="button__icon transparent">
                                <ArrowSquare />
                            </Button.Base>
                        </Text.ExternalLink>
                    </Card.Row>
                    <Card.Row>
                        <Text.MainMedium>{t('termsAndConditions')}</Text.MainMedium>
                        <Text.ExternalLink path={termsUrl}>
                            <Button.Base as="span" className="button__icon transparent">
                                <ArrowSquare />
                            </Button.Base>
                        </Text.ExternalLink>
                    </Card.Row>
                    <Card.Row>
                        <Text.MainMedium>{t('licence')}</Text.MainMedium>
                        <Text.ExternalLink path={urls.licenseAttributions}>
                            <Button.Base as="span" className="button__icon transparent">
                                <ArrowSquare />
                            </Button.Base>
                        </Text.ExternalLink>
                    </Card.Row>
                </Card>
                <Text.Heading>{t('support')}</Text.Heading>
                <Text.Capture>
                    {t('supportDescription')}
                    <Text.ExternalLink path="mailto:support@concordium.software">
                        support@concordium.software
                    </Text.ExternalLink>
                </Text.Capture>
            </Page.Main>
            <Page.Footer>
                <Text.Capture>{t('version', { version: getVersionName() })}</Text.Capture>
            </Page.Footer>
        </Page>
    );
}

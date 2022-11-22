import React, { ReactNode } from 'react';
import Logo from '@assets/svg/concordium.svg';
import ConcordiumLetters from '@assets/svg/concordium-letters.svg';
import { useTranslation } from 'react-i18next';
import { SubmitHandler } from 'react-hook-form';
import Form from '@popup/shared/Form';
import FormCheckbox from '@popup/shared/Form/Checkbox';
import ExternalLink from '@popup/shared/ExternalLink';
import urls from '@shared/constants/url';
import Submit from '@popup/shared/Form/Submit';
import { useAtom } from 'jotai';
import { acceptedTermsAtom } from '@popup/store/settings';
import { getTermsAndConditionHash } from '@shared/utils/network-helpers';

type FormValues = {
    termsAndConditionsApproved: boolean;
};

type Props = {
    children: ReactNode;
    onSubmit: () => void;
};

export default function AcceptTerms({ children, onSubmit }: Props) {
    const { t } = useTranslation('termsAndConditions');
    const [{ loading, value: acceptedTerms }, setAcceptedTerms] = useAtom(acceptedTermsAtom);

    const handleSubmit: SubmitHandler<FormValues> = async () => {
        let value = acceptedTerms?.value;
        if (!value) {
            value = await getTermsAndConditionHash();
        }
        setAcceptedTerms({ accepted: true, value });
        onSubmit();
    };

    if (loading) {
        return null;
    }

    return (
        <div className="onboarding-setup__intro-wrapper">
            <div className="onboarding-setup__intro-wrapper__logos">
                <Logo className="onboarding-setup__intro-wrapper__logo" />
                <ConcordiumLetters className="onboarding-setup__intro-wrapper__concordium-letters" />
            </div>
            <div className="onboarding-setup__intro-wrapper__description">{children}</div>

            <Form onSubmit={handleSubmit}>
                {(f) => {
                    return (
                        <>
                            <FormCheckbox
                                register={f.register}
                                name="termsAndConditionsApproved"
                                className="onboarding-setup__intro-wrapper__terms-and-conditions"
                                description={
                                    <div>
                                        {t('form.termsAndConditionsDescription')}{' '}
                                        <ExternalLink
                                            path={urls.termsAndConditions}
                                            label={t('form.termsAndConditionsLinkDescription')}
                                        />
                                    </div>
                                }
                                rules={{ required: t('form.termsAndConditionsRequired') }}
                            />
                            <Submit className="onboarding-setup__intro-wrapper__continue-button" width="medium">
                                {t('continue')}
                            </Submit>
                        </>
                    );
                }}
            </Form>
        </div>
    );
}

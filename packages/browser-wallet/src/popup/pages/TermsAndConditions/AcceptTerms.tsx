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
import { getTermsAndConditionsConfig } from '@shared/utils/network-helpers';
import { useAsyncMemo } from 'wallet-common-helpers';

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
    const config = useAsyncMemo(getTermsAndConditionsConfig, undefined, []);

    const handleSubmit: SubmitHandler<FormValues> = async () => {
        const version = config?.version || acceptedTerms?.version;
        // If we didn't find a version, put in an empty version
        setAcceptedTerms({ accepted: true, version: version || '' });
        onSubmit();
    };

    if (loading) {
        return null;
    }

    return (
        <div className="terms-and-conditions">
            <div className="terms-and-conditions__logos">
                <Logo className="terms-and-conditions__logo" />
                <ConcordiumLetters className="terms-and-conditions__concordium-letters" />
            </div>
            <div className="terms-and-conditions__description">{children}</div>

            <Form className="terms-and-conditions__form" onSubmit={handleSubmit}>
                {(f) => {
                    return (
                        <>
                            <FormCheckbox
                                register={f.register}
                                name="termsAndConditionsApproved"
                                className="terms-and-conditions__terms-and-conditions"
                                description={
                                    <div>
                                        {t('form.termsAndConditionsDescription')}{' '}
                                        <ExternalLink path={config?.url || urls.termsAndConditions}>
                                            {t('form.termsAndConditionsLinkDescription')}
                                        </ExternalLink>
                                    </div>
                                }
                                rules={{ required: t('form.termsAndConditionsRequired') }}
                            />
                            <Submit className="terms-and-conditions__continue-button" width="medium">
                                {t('continue')}
                            </Submit>
                        </>
                    );
                }}
            </Form>
        </div>
    );
}

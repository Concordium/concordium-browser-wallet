import React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Logo from '@assets/svg/concordium.svg';
import ConcordiumLetters from '@assets/svg/concordium-letters.svg';
import { useTranslation } from 'react-i18next';
import { SubmitHandler } from 'react-hook-form';
import Form from '@popup/shared/Form';
import FormCheckbox from '@popup/shared/Form/Checkbox';
import ExternalLink from '@popup/shared/ExternalLink';
import Submit from '@popup/shared/Form/Submit';
import urls from '@popup/constants/urls';
import { setupRoutes } from './routes';
import { EnterRecoveryPhrase } from './RecoveryPhrase';
import { ChooseNetwork } from './ChooseNetwork';
import SetupPasscode from './SetupPasscode';
import CreateOrRestore from './CreateOrRestore';
import GenerateSeedPhrase from './GenerateSeedPhrase';
import RestoreRecoveryPhrase from './RecoverSeedPhrase';
import PerformRecovery from './PerformRecovery';

type FormValues = {
    termsAndConditionsApproved: boolean;
};

function Intro() {
    const navigate = useNavigate();
    const { t } = useTranslation('setup');

    const handleSubmit: SubmitHandler<FormValues> = () => {
        navigate(setupRoutes.passcode);
    };

    return (
        <div className="onboarding-setup__intro-wrapper">
            <div className="onboarding-setup__intro-wrapper__logos">
                <Logo className="onboarding-setup__intro-wrapper__logo" />
                <ConcordiumLetters className="onboarding-setup__intro-wrapper__concordium-letters" />
            </div>
            <div className="onboarding-setup__intro-wrapper__description">
                <p>{t('intro.welcome')}</p>
                <p>{t('intro.description')}</p>
            </div>

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
                                        {t('intro.form.termsAndConditionsDescription')}{' '}
                                        <ExternalLink
                                            path={urls.termsAndConditions}
                                            label={t('intro.form.termsAndConditionsLinkDescription')}
                                        />
                                    </div>
                                }
                                rules={{ required: t('intro.form.termsAndConditionsRequired') }}
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

export default function SetupRoutes() {
    return (
        <Routes>
            <Route index element={<Intro />} />
            <Route path={setupRoutes.passcode} element={<SetupPasscode />} />
            <Route path={setupRoutes.createOrRestore} element={<CreateOrRestore />} />
            <Route path={setupRoutes.createNew} element={<GenerateSeedPhrase />} />
            <Route path={setupRoutes.enterRecoveryPhrase} element={<EnterRecoveryPhrase />} />
            <Route path={setupRoutes.restore} element={<RestoreRecoveryPhrase />} />
            <Route path={setupRoutes.performRecovery} element={<PerformRecovery />} />
            <Route path={setupRoutes.chooseNetwork} element={<ChooseNetwork />} />
        </Routes>
    );
}

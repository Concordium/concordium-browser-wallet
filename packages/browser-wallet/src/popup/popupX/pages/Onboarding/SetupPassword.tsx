import React from 'react';
import ConcordiumLogo from '@assets/svgX/concordium-logo.svg';
import FormPassword from '@popup/popupX/shared/Form/Password';
import Submit from '@popup/popupX/shared/Form/Submit';
import Form from '@popup/popupX/shared/Form/Form';
import { useNavigate } from 'react-router-dom';
import { relativeRoutes } from '@popup/popupX/constants/routes';
import { useTranslation } from 'react-i18next';
import Button from '@popup/popupX/shared/Button';

export default function SetupPassword() {
    const { t } = useTranslation('x', { keyPrefix: 'onboarding.setupPassword' });
    const nav = useNavigate();
    const navToNext = () => nav(`../${relativeRoutes.onboarding.idIntro.path}`);
    return (
        <div className="onboarding-container">
            <div className="setup_password__title">
                <ConcordiumLogo />
                <span className="heading_medium">{t('setPassword')}</span>
                <span className="text__main_regular">{t('firstStep')}</span>
            </div>
            <Form
                onSubmit={() => {
                    navToNext();
                }}
                // formMethods={}
                className="setup_password__form"
            >
                {(f) => {
                    return (
                        <>
                            <div>
                                <FormPassword
                                    autoFocus
                                    control={f.control}
                                    name="passcode"
                                    label={t('enterPasscode')}
                                    // rules={{
                                    //     required: 'setupPasscode.form.passcodeRequired',
                                    //     minLength: { value: 6, message: 'setupPasscode.form.passcodeMinLength' },
                                    // }}
                                />
                                <FormPassword
                                    control={f.control}
                                    name="passcodeAgain"
                                    label={t('enterPasscodeAgain')}
                                    // rules={{ validate: passcodesAreEqual }}
                                />
                            </div>
                            <Button.Main type="submit" label={t('continue')} />
                        </>
                    );
                }}
            </Form>
        </div>
    );
}

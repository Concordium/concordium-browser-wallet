import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { networkConfigurationAtom } from '@popup/store/settings';
import Page from '@popup/popupX/shared/Page';
import Button from '@popup/popupX/shared/Button';
import { useTranslation } from 'react-i18next';
import Text from '@popup/popupX/shared/Text';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import appTracker from '@shared/analytics';

export default function CreateOrRestore() {
    const { t } = useTranslation('x', { keyPrefix: 'onboarding.createOrRestore' });
    const [{ name }] = useAtom(networkConfigurationAtom);
    const nav = useNavigate();
    const navToRestore = () => nav(absoluteRoutes.onboarding.setupPassword.createOrRestore.restoreWallet.path);
    const navToCreate = () => nav(absoluteRoutes.onboarding.setupPassword.createOrRestore.generateSeedPhrase.path);
    const navToSelectNetwork = () => nav(absoluteRoutes.onboarding.setupPassword.createOrRestore.selectNetwork.path);

    return (
        <Page className="create-or-restore">
            <Page.Top heading={t('createOrRestore')}>
                <Button.Base as="span" onClick={navToSelectNetwork}>
                    <Text.Capture className="external-link">{name}</Text.Capture>
                </Button.Base>
            </Page.Top>
            <Page.Main>
                <Text.Capture>{t('optionsInfo')}</Text.Capture>
            </Page.Main>
            <Page.Footer>
                <Button.Main
                    label={t('create')}
                    onClick={() => {
                        navToCreate();
                        appTracker.welcomeSetUpWalletDialogCreateClicked();
                    }}
                />
                <Button.Main
                    label={t('restore')}
                    onClick={() => {
                        navToRestore();
                        appTracker.welcomeSetUpWalletDialogImportClicked();
                    }}
                />
            </Page.Footer>
        </Page>
    );
}

/* eslint-disable no-console */
import React from 'react';
import Page from '@popup/popupX/shared/Page';
import Button from '@popup/popupX/shared/Button';
import Text from '@popup/popupX/shared/Text';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { absoluteRoutes } from '@popup/popupX/constants/routes';

export default function CreateAccountType() {
    const { t } = useTranslation('x', { keyPrefix: 'createAccountType' });
    const nav = useNavigate();

    const handleBrowserWallet = () => {
        nav(absoluteRoutes.settings.createAccount.path);
    };

    const handleLedgerAccount = () => {
        const { path } = absoluteRoutes.settings.accounts.createLedger;
        console.log('Ledger button clicked, navigating to:', path);
        console.log('Full absoluteRoutes.settings.accounts:', absoluteRoutes.settings.accounts);
        nav(path);
    };

    return (
        <Page className="create-account-type-x">
            <Page.Top heading={t('title')} />
            <Page.Main>
                <Text.Capture className="m-b-20">{t('description')}</Text.Capture>

                <div className="account-type-options">
                    <div
                        className="account-type-card"
                        style={{
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            padding: '20px',
                            marginBottom: '16px',
                        }}
                    >
                        <Text.MainMedium className="m-b-10">{t('browserWallet')}</Text.MainMedium>
                        <Text.Capture className="m-b-16">{t('browserWalletDescription')}</Text.Capture>
                        <Button.Main label={t('createBrowserWallet')} onClick={handleBrowserWallet} disabled={false} />
                    </div>

                    <div
                        className="account-type-card"
                        style={{
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            padding: '20px',
                        }}
                    >
                        <Text.MainMedium className="m-b-10">{t('ledgerAccount')}</Text.MainMedium>
                        <Text.Capture className="m-b-16">{t('ledgerAccountDescription')}</Text.Capture>
                        <Button.Main label={t('createLedgerAccount')} onClick={handleLedgerAccount} disabled={false} />
                    </div>
                </div>
            </Page.Main>
        </Page>
    );
}

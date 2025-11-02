import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { networkConfigurationAtom } from '@popup/store/settings';
import Page from '@popup/popupX/shared/Page';
import Button from '@popup/popupX/shared/Button';
import { useTranslation } from 'react-i18next';
import Text from '@popup/popupX/shared/Text';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import ConcordiumWalletButton from '@popup/popupX/shared/ButtonAlpha/ConcordiumWalletButton';
import ConcordiumLedgerButton from '@popup/popupX/shared/ButtonAlpha/ConcordiumLedgerButton';
import RestoreWalletButton from '@popup/popupX/shared/ButtonAlpha/RestoreWalletButton';
import RestoreLedgerButton from '@popup/popupX/shared/ButtonAlpha/RestoreLedgerButton';

export default function CreateOrRestore() {
    const { t } = useTranslation('x', { keyPrefix: 'onboarding.createOrRestore' });
    const [{ name }] = useAtom(networkConfigurationAtom);
    const nav = useNavigate();
    const navToRestore = () => nav(absoluteRoutes.onboarding.setupPassword.createOrRestore.restoreWallet.path);
    const navToCreate = () => nav(absoluteRoutes.onboarding.setupPassword.createOrRestore.generateSeedPhrase.path);
    const navToSelectNetwork = () => nav(absoluteRoutes.onboarding.setupPassword.createOrRestore.selectNetwork.path);
    const navToRestoreLedger = () => nav(absoluteRoutes.onboarding.setupPassword.createOrRestore.restoreLedger.path);
    const navToCreateLedger = () => nav(absoluteRoutes.onboarding.setupPassword.createOrRestore.idCardsInfoLedger.path);

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
                <div>
                    <ConcordiumWalletButton onClick={navToCreate} />
                </div>
                <div>
                    <ConcordiumLedgerButton onClick={navToCreateLedger} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ flex: 1, height: 1, background: '#888' }} />
                    <span style={{ margin: '0 12px', color: '#888', fontWeight: 500 }}>OR</span>
                    <div style={{ flex: 1, height: 1, background: '#888' }} />
                </div>
                <div>
                    <RestoreWalletButton onClick={navToRestore} />
                </div>
                <div>
                    <RestoreLedgerButton onClick={navToRestoreLedger} />
                </div>
            </Page.Footer>
        </Page>
    );
}

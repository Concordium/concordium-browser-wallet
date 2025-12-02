import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import {
    encryptedSeedPhraseAtom,
    hasBeenSavedSeedAtom,
    networkConfigurationAtom,
    sessionOnboardingLocationAtom,
    sessionPasscodeAtom,
} from '@popup/store/settings';
import Page from '@popup/popupX/shared/Page';
import Button from '@popup/popupX/shared/Button';
import { ButtonProps } from '@popup/popupX/shared/Button/Button';
import Text from '@popup/popupX/shared/Text';
import WalletCoin from '@assets/svgX/UiKit/Interface/wallet-coin.svg';
import RestoreSeed from '@assets/svgX/UiKit/Interface/restore-seed-phrase.svg';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import { generateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { encrypt } from '@shared/utils/crypto';

function OnboardingOption({
    icon,
    title,
    description,
    className,
    ...props
}: { icon: ReactNode; title: string; description: string } & ButtonProps) {
    return (
        <Button.Base className={clsx('button__onboarding-option', className)} {...props}>
            <div className="icon-container">{icon}</div>
            <div className="text-container">
                <Text.MainMedium>{title}</Text.MainMedium>
                <Text.Capture>{description}</Text.Capture>
            </div>
        </Button.Base>
    );
}

export default function CreateOrRestore() {
    const { t } = useTranslation('x', { keyPrefix: 'onboarding.createOrRestore' });
    const [{ name }] = useAtom(networkConfigurationAtom);
    const setHasBeenSavedSeed = useSetAtom(hasBeenSavedSeedAtom);
    const setOnboardingLocation = useSetAtom(sessionOnboardingLocationAtom);
    const setEncryptedSeedPhrase = useSetAtom(encryptedSeedPhraseAtom);
    const sessionPasscode = useAtomValue(sessionPasscodeAtom);
    const passcode = sessionPasscode.value;

    const nav = useNavigate();
    const pathToRestore = absoluteRoutes.onboarding.welcome.setupPassword.createOrRestore.restoreWallet.path;
    const navToRestore = () => nav(pathToRestore);
    const pathToCreate = absoluteRoutes.onboarding.welcome.setupPassword.createOrRestore.requestIdentity.path;
    const navToCreate = () => nav(pathToCreate);
    const navToSelectNetwork = () =>
        nav(absoluteRoutes.onboarding.welcome.setupPassword.createOrRestore.selectNetwork.path);

    const onCreate = () => {
        // Check only for password. Because user can nav back to password and change it.
        // In this case Seed Phrase should be recreated and encrypted with new password
        if (passcode) {
            const newSeedPhrase = generateMnemonic(wordlist, 256);
            encrypt(newSeedPhrase, passcode).then((newEncryptedSeedPhrase) => {
                setEncryptedSeedPhrase(newEncryptedSeedPhrase).then(() => {
                    setOnboardingLocation(pathToCreate);
                    setHasBeenSavedSeed(false).then(() => {
                        navToCreate();
                    });
                });
            });
        }
    };
    const onRestore = () => {
        setOnboardingLocation(pathToRestore);
        navToRestore();
    };

    return (
        <Page className="create-or-restore">
            <Page.Top heading={t('createOrRestore')}>
                <Button.Tertiary label={name} size="small" onClick={navToSelectNetwork} />
            </Page.Top>
            <Page.Main>
                <Text.Capture>{t('optionsInfo')}</Text.Capture>
                <OnboardingOption
                    title={t('walletAccount')}
                    description={t('walletAccountDescription')}
                    icon={<WalletCoin />}
                    onClick={onCreate}
                />
                <div className="split-separator">
                    <Text.Capture>{t('or')}</Text.Capture>
                </div>
                <OnboardingOption
                    title={t('restore')}
                    description={t('restoreDescription')}
                    icon={<RestoreSeed />}
                    onClick={onRestore}
                />
            </Page.Main>
        </Page>
    );
}

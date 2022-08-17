import PageHeader from '@popup/shared/PageHeader';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import Button from '@popup/shared/Button';
import { absoluteRoutes } from '@popup/constants/routes';
import { TextArea as ControlledTextArea } from '@popup/shared/Form/TextArea';
import { seedPhraseAtom } from '@popup/state';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { setupRoutes } from './routes';

export default function GenerateSeedPhrase() {
    const navigate = useNavigate();
    const { t } = useTranslation('setup');
    const [seedPhrase, setSeedPhrase] = useAtom(seedPhraseAtom);

    useEffect(() => {
        if (!seedPhrase) {
            setSeedPhrase(generateMnemonic(wordlist, 256));
        }
    }, []);

    return (
        <>
            <PageHeader canGoBack>Your recovery phrase</PageHeader>
            <div className="page-with-header">
                <div className="page-with-header__description">{t('recoveryPhrase.description')}</div>
                <div className="p-10">
                    <ControlledTextArea value={seedPhrase} />
                </div>
                <Button
                    className="page-with-header__continue-button"
                    width="narrow"
                    onClick={() => navigate(`${absoluteRoutes.setup.path}/${setupRoutes.enterRecoveryPhrase}`)}
                >
                    {t('continue')}
                </Button>
            </div>
        </>
    );
}

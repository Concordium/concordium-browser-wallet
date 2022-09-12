import React, { useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAtomValue, useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { credentialsAtom, selectedAccountAtom } from '@popup/store/account';
import { identitiesAtom } from '@popup/store/identity';
import Button from '@popup/shared/Button';
import { absoluteRoutes } from '@popup/constants/routes';
import { noOp, displayAsCcd } from 'wallet-common-helpers';
import { displaySplitAddress } from '@popup/shared/utils/account-helpers';
import { BackgroundResponseStatus, RecoveryBackgroundResponse } from '@shared/utils/types';
import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import PageHeader from '@popup/shared/PageHeader';

interface Location {
    state: {
        payload: RecoveryBackgroundResponse;
    };
}

export default function DisplayRecoveryResult() {
    const { state } = useLocation() as Location;
    const { payload } = state;
    const { setReturnLocation, withClose } = useContext(fullscreenPromptContext);
    const { t } = useTranslation('recovery');
    const navigate = useNavigate();
    const identities = useAtomValue(identitiesAtom);
    const credentials = useAtomValue(credentialsAtom);
    const [selectedAccount, setSelectedAccount] = useAtom(selectedAccountAtom);

    useEffect(() => setReturnLocation(absoluteRoutes.home.account.path), []);

    useEffect(() => {
        if (!selectedAccount && credentials.length) {
            setSelectedAccount(credentials[0].address);
        }
    }, [selectedAccount]);

    return (
        <>
            <PageHeader>{t('main.title')}</PageHeader>
            <div className="recovery__main onboarding-setup__page-with-header">
                {payload.status === BackgroundResponseStatus.Success && (
                    <>
                        <div className="recovery__main__description">
                            {t(identities.length ? 'finish.success' : 'finish.noneFound')}
                        </div>
                        <div className="recovery__main__results">
                            {identities.map((identity) => (
                                <div
                                    key={`${identity.providerIndex}-${identity.index}`}
                                    className="recovery__main__identity"
                                >
                                    <p>{identity.name}</p>
                                    {credentials
                                        .filter((cred) => cred.identityIndex === identity.index)
                                        .map((cred) => (
                                            <div className="recovery__main__credential" key={cred.credId}>
                                                <p>{displaySplitAddress(cred.address)}</p>
                                                <p>{displayAsCcd(0n)}</p>
                                            </div>
                                        ))}
                                </div>
                            ))}
                        </div>
                        <Button width="medium" className="recovery__main__button" onClick={withClose(noOp)}>
                            {t('continue')}
                        </Button>
                    </>
                )}
                {payload.status === BackgroundResponseStatus.Error && (
                    <>
                        <p className="recovery__main__description">{t('finish.error')}</p>
                        <p>{payload.reason}</p>
                        <Button
                            width="medium"
                            className="recovery__main__button"
                            onClick={() => navigate(absoluteRoutes.recovery.path)}
                        >
                            {t('retry')}
                        </Button>
                    </>
                )}
            </div>
        </>
    );
}

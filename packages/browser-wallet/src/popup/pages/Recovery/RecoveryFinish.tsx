import React, { useEffect, useContext, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAtomValue, useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { credentialsAtom, selectedAccountAtom } from '@popup/store/account';
import { identitiesAtom } from '@popup/store/identity';
import Button from '@popup/shared/Button';
import { absoluteRoutes } from '@popup/constants/routes';
import { noOp, displayAsCcd } from 'wallet-common-helpers';
import { displaySplitAddress } from '@popup/shared/utils/account-helpers';
import { IdentityIdentifier, BackgroundResponseStatus, RecoveryBackgroundResponse } from '@shared/utils/types';
import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import PageHeader from '@popup/shared/PageHeader';
import { identityMatch, isIdentityOfCredential } from '@shared/utils/identity-helpers';

interface Location {
    state: {
        payload: RecoveryBackgroundResponse;
    };
}

interface Props {
    added: {
        accounts: string[];
        identities: IdentityIdentifier[];
    };
}

export function DisplaySuccess({ added }: Props) {
    const { t } = useTranslation('recovery');
    const identities = useAtomValue(identitiesAtom);
    const credentials = useAtomValue(credentialsAtom);
    const [selectedAccount, setSelectedAccount] = useAtom(selectedAccountAtom);

    const addedAccounts = useMemo(
        () => credentials.filter((cred) => added.accounts.some((address) => cred.address === address)),
        [credentials.length, added.accounts.length]
    );
    // Also includes identities that existed but have had accounts added.
    const addedIdentities = useMemo(
        () =>
            identities.filter(
                (id) => added.identities.some(identityMatch(id)) || addedAccounts.some(isIdentityOfCredential(id))
            ),
        [identities.length, addedAccounts.length, added.identities.length]
    );

    useEffect(() => {
        if (!selectedAccount && credentials.length) {
            setSelectedAccount(credentials[0].address);
        }
    }, [selectedAccount, credentials.length]);

    return (
        <>
            <div className="recovery__main__description">
                {t(addedIdentities.length ? 'finish.success' : 'finish.noneFound')}
            </div>
            <div className="recovery__main__results">
                {addedIdentities.map((identity) => (
                    <div key={`${identity.providerIndex}-${identity.index}`} className="recovery__main__identity">
                        <p>
                            {identity.name}
                            {!added.identities.some(identityMatch(identity)) && ' (Already existed)'}
                        </p>
                        {addedAccounts.filter(isIdentityOfCredential(identity)).map((cred) => (
                            <div className="recovery__main__credential" key={cred.credId}>
                                <p>{displaySplitAddress(cred.address)}</p>
                                <p>{displayAsCcd(0n)}</p>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </>
    );
}

export default function DisplayRecoveryResult() {
    const { state } = useLocation() as Location;
    const { payload } = state;
    const { setReturnLocation, withClose } = useContext(fullscreenPromptContext);
    const { t } = useTranslation('recovery');
    const navigate = useNavigate();

    useEffect(() => setReturnLocation(absoluteRoutes.home.account.path), []);

    return (
        <>
            <PageHeader>{t('main.title')}</PageHeader>
            <div className="recovery__main onboarding-setup__page-with-header">
                {payload.status === BackgroundResponseStatus.Success && (
                    <>
                        <DisplaySuccess added={payload.added} />
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

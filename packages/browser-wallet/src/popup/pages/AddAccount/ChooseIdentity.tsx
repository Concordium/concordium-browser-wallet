import React, { Fragment, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAtomValue, useSetAtom } from 'jotai';
import IdentityProviderIcon from '@popup/shared/IdentityProviderIcon';

import IdCard from '@popup/shared/IdCard';
import { identitiesAtom, selectedIdentityIndexAtom, identityProvidersAtom } from '@popup/store/identity';
import { Identity, CreationStatus } from '@shared/storage/types';
import { absoluteRoutes } from '@popup/constants/routes';
import Button from '@popup/shared/Button';
import { credentialsAtom } from '@popup/store/account';
import { getMaxAccountsForIdentity, isIdentityOfCredential } from '@shared/utils/identity-helpers';
import ErrorMessage from '@popup/shared/Form/ErrorMessage';
import { getNextEmptyCredNumber } from '@popup/shared/utils/account-helpers';

export default function ChooseIdentity() {
    const { t } = useTranslation('addAccount');
    const identities = useAtomValue(identitiesAtom);
    const setSelectedIdentityIndex = useSetAtom(selectedIdentityIndexAtom);
    const nav = useNavigate();
    const providers = useAtomValue(identityProvidersAtom);
    const credentials = useAtomValue(credentialsAtom);

    const findProvider = useCallback(
        (identity: Identity) => providers.find((p) => p.ipInfo.ipIdentity === identity.providerIndex),
        [providers]
    );

    if (!identities.length) {
        return (
            <div className="flex-column align-center h-full">
                <p className="m-t-20 m-h-40">{t('noIdentities')}</p>
                <Button
                    className="add-account-page__no-identity-button"
                    width="wide"
                    onClick={() => nav(absoluteRoutes.home.identities.add.path)}
                >
                    {t('createIdentity')}
                </Button>
            </div>
        );
    }

    return (
        <div className="flex-column align-center">
            <p className="m-t-20 text-center p-h-10">{t('chooseIdentity')}</p>
            {identities.map((identity, i) => {
                if (identity.status !== CreationStatus.Confirmed) {
                    return null;
                }
                const credsOfCurrentIdentity = credentials.filter(isIdentityOfCredential(identity));
                const nextCredNumber = getNextEmptyCredNumber(credsOfCurrentIdentity);
                if (nextCredNumber < getMaxAccountsForIdentity(identity)) {
                    return (
                        <IdCard
                            name={identity.name}
                            key={`${identity.providerIndex}-${identity.index}`}
                            provider={<IdentityProviderIcon provider={findProvider(identity)} />}
                            status={identity.status}
                            className="m-t-10"
                            onClick={() => {
                                setSelectedIdentityIndex(i);
                                nav('confirm');
                            }}
                        />
                    );
                }
                return (
                    <Fragment key={`${identity.providerIndex}-${identity.index}`}>
                        <IdCard
                            name={identity.name}
                            provider={<IdentityProviderIcon provider={findProvider(identity)} />}
                            status={identity.status}
                            className="m-t-10 add-account-page__disabled-identity-card"
                        />
                        <ErrorMessage className="m-t-10 add-account-page__error-message">
                            {t('maxAccountsReached')}
                        </ErrorMessage>
                    </Fragment>
                );
            })}
        </div>
    );
}

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAtomValue, useSetAtom } from 'jotai';
import IdentityProviderIcon from '@popup/shared/IdentityProviderIcon';

import IdCard from '@popup/shared/IdCard';
import { identitiesAtom, selectedIdentityIdAtom, identityProvidersAtom } from '@popup/store/identity';
import { Identity, CreationStatus } from '@shared/storage/types';
import { absoluteRoutes } from '@popup/constants/routes';
import Button from '@popup/shared/Button';

export default function ChooseIdentity() {
    const { t } = useTranslation('addAccount');
    const identities = useAtomValue(identitiesAtom);
    const setSelectedIdentityId = useSetAtom(selectedIdentityIdAtom);
    const nav = useNavigate();
    const providers = useAtomValue(identityProvidersAtom);

    const findProvider = useCallback(
        (identity: Identity) => providers.find((p) => p.ipInfo.ipIdentity === identity.provider),
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
            <p className="m-t-20">{t('chooseIdentity')}</p>
            {identities
                .filter((identity) => identity.status === CreationStatus.Confirmed)
                .map((identity) => (
                    <IdCard
                        name={identity.name}
                        key={identity.id}
                        provider={<IdentityProviderIcon provider={findProvider(identity)} />}
                        status={identity.status}
                        className="m-t-10"
                        onClick={() => {
                            setSelectedIdentityId(identity.id);
                            nav('confirm');
                        }}
                    />
                ))}
        </div>
    );
}

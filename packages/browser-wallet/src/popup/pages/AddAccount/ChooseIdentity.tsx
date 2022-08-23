import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAtomValue, useSetAtom } from 'jotai';
import IdentityProviderIcon from '@popup/shared/IdentityProviderIcon';

import IdCard from '@popup/shared/IdCard';
import { identitiesAtom, selectedIdentityIdAtom, identityProvidersAtom } from '@popup/store/identity';
import { Identity, CreationStatus } from '@shared/storage/types';

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
                        onNameChange={() => {}}
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

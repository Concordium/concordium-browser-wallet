import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAtomValue, useSetAtom } from 'jotai';

import IdCard from '@popup/shared/IdCard';
import { identitiesAtom, selectedIdentityIdAtom } from '@popup/store/identity';
import { IdentityStatus } from '@shared/storage/types';

export default function AddAccount() {
    const { t } = useTranslation('addAccount');
    const identities = useAtomValue(identitiesAtom);
    const setSelectedIdentityId = useSetAtom(selectedIdentityIdAtom);
    const nav = useNavigate();

    return (
        <div className="flex-column align-center">
            <p className="m-t-20">{t('chooseIdentity')}</p>
            {identities
                .filter((identity) => identity.status === IdentityStatus.Confirmed)
                .map((identity) => (
                    <IdCard
                        name={identity.name}
                        key={identity.id}
                        provider={<p>Test</p>}
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

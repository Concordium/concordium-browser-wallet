import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { useAtomValue, useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { ClassName } from 'wallet-common-helpers';

import CheckmarkIcon from '@assets/svg/checkmark-blue.svg';
import { absoluteRoutes } from '@popup/constants/routes';
import { identitiesAtom, selectedIdentityIdAtom } from '@popup/store/identity';
import { useTranslation } from 'react-i18next';
import { Identity, IdentityStatus } from '@shared/storage/types';
import { accountsPerIdentityAtom } from '@popup/store/account';
import EntityList from '../EntityList';

type ItemProps = {
    identity: Identity;
    checked: boolean;
    selected: boolean;
    accountCount: number;
};

function getStatusText(identity: Identity, accountCount = 0): string {
    switch (identity.status) {
        case IdentityStatus.Pending:
            return 'Verification pending';
        case IdentityStatus.Rejected:
            return 'Verification failed';
        case IdentityStatus.Confirmed: {
            return `${accountCount} account${accountCount !== 1 ? 's' : ''}`;
        }
        default:
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            throw new Error(`Unexpected identity status: ${(identity as any).status}`);
    }
}

function IdentityListItem({ identity, checked, selected, accountCount }: ItemProps) {
    return (
        <div className={clsx('main-layout__header-list-item', checked && 'main-layout__header-list-item--checked')}>
            <div className="main-layout__header-list-item__primary">
                <div className="flex align-center">
                    {identity.name} {selected && <CheckmarkIcon className="main-layout__header-list-item__check" />}
                </div>
            </div>
            <div className="main-layout__header-list-item__secondary">{getStatusText(identity, accountCount)}</div>
        </div>
    );
}

type Props = ClassName & {
    onSelect(): void;
};

const IdentityList = forwardRef<HTMLDivElement, Props>(({ className, onSelect }, ref) => {
    const identities = useAtomValue(identitiesAtom);
    const accountsPerIdentity = useAtomValue(accountsPerIdentityAtom);
    const [selectedIdentityId, setSelectedIdentityId] = useAtom(selectedIdentityIdAtom);
    const nav = useNavigate();
    const { t } = useTranslation('mainLayout');

    return (
        <EntityList<Identity>
            className={className}
            onSelect={(a) => {
                setSelectedIdentityId(a.id);
                onSelect();
            }}
            onNew={() => nav(absoluteRoutes.home.identities.add.path)}
            entities={identities}
            getKey={(a) => a.id}
            newText={t('identityList.new')}
            ref={ref}
            searchableKeys={['name']}
        >
            {(a, checked) => (
                <IdentityListItem
                    identity={a}
                    checked={checked}
                    selected={a.id === selectedIdentityId}
                    accountCount={accountsPerIdentity[a.id]?.length || 0}
                />
            )}
        </EntityList>
    );
});

export default IdentityList;

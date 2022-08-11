import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { useAtomValue, useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { ClassName } from 'wallet-common-helpers';

import CheckmarkIcon from '@assets/svg/checkmark-blue.svg';
import { absoluteRoutes } from '@popup/constants/routes';
import { identitiesAtom, selectedIdentityIdAtom } from '@popup/store/identity';
import { useTranslation } from 'react-i18next';
import { Identity } from '@shared/storage/types';
import EntityList from '../EntityList';

type ItemProps = {
    identity: Identity;
    checked: boolean;
    selected: boolean;
};

function IdentityListItem({ identity: { name }, checked, selected }: ItemProps) {
    return (
        <div className={clsx('account-list-item', checked && 'account-list-item--checked')}>
            <div className="account-list-item__identity">
                <div className="flex align-center">
                    {name} {selected && <CheckmarkIcon className="account-list-item__check" />}
                </div>
            </div>
        </div>
    );
}

type Props = ClassName & {
    onSelect(): void;
};

const IdentityList = forwardRef<HTMLDivElement, Props>(({ className, onSelect }, ref) => {
    const identities = useAtomValue(identitiesAtom);
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
            newText={t('accountList.new')}
            ref={ref}
            searchableKeys={['name']}
        >
            {(a, checked) => <IdentityListItem identity={a} checked={checked} selected={a.id === selectedIdentityId} />}
        </EntityList>
    );
});

export default IdentityList;

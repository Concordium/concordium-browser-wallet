import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { useAtomValue, useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { ClassName } from 'wallet-common-helpers';

import CheckmarkIcon from '@assets/svg/checkmark-blue.svg';
import { absoluteRoutes } from '@popup/constants/routes';
import { pendingIdentitiesAtom, selectedIdentityAtom } from '@popup/store/settings';
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
                    {name.slice(0, 4)}...{name.slice(name.length - 4)}{' '}
                    {selected && <CheckmarkIcon className="account-list-item__check" />}
                </div>
            </div>
        </div>
    );
}

type Props = ClassName & {
    onSelect(): void;
};

const IdentityList = forwardRef<HTMLDivElement, Props>(({ className, onSelect }, ref) => {
    const identities = useAtomValue(pendingIdentitiesAtom);
    const [selectedIdentity, setSelectedIdentity] = useAtom(selectedIdentityAtom);
    const nav = useNavigate();
    const { t } = useTranslation('mainLayout');

    return (
        <EntityList<Identity>
            className={className}
            onSelect={(a) => {
                setSelectedIdentity(a);
                onSelect();
            }}
            onNew={() => nav(absoluteRoutes.home.identities.add.path)}
            entities={identities}
            getKey={(a) => a.index}
            newText={t('accountList.new')}
            ref={ref}
        >
            {(a, checked) => (
                <IdentityListItem
                    identity={a}
                    checked={checked}
                    selected={a.index === selectedIdentity?.index && a.network === selectedIdentity.network}
                />
            )}
        </EntityList>
    );
});

export default IdentityList;

import React, { forwardRef, useMemo } from 'react';
import clsx from 'clsx';
import { useAtomValue, useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { ClassName, displayAsCcd } from 'wallet-common-helpers';
import CopyButton from '@popup/shared/CopyButton';
import CheckmarkIcon from '@assets/svg/checkmark-blue.svg';
import BakerIcon from '@assets/svg/baker.svg';
import DelegationIcon from '@assets/svg/delegation.svg';
import { absoluteRoutes } from '@popup/constants/routes';
import { credentialsAtom, selectedAccountAtom } from '@popup/store/account';
import { useTranslation } from 'react-i18next';
import { displaySplitAddress, useIdentityName } from '@popup/shared/utils/account-helpers';
import { WalletCredential } from '@shared/storage/types';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext';
import { isDelegatorAccount, isBakerAccount, AccountInfo } from '@concordium/web-sdk';
import EntityList from '../EntityList';

export type Account = { address: string };

type ItemProps = {
    account: WalletCredential;
    checked: boolean;
    selected: boolean;
};

function BakerOrDelegatorIcon({ accountInfo, className }: { accountInfo: AccountInfo; className: string }) {
    if (isDelegatorAccount(accountInfo)) {
        return <DelegationIcon width="71" className={className} />;
    }
    if (isBakerAccount(accountInfo)) {
        return <BakerIcon width="65" className={className} />;
    }
    return null;
}

function AccountListItem({ account, checked, selected }: ItemProps) {
    const accountInfo = useAccountInfo(account);
    const totalBalance = useMemo(
        () => accountInfo?.accountAmount?.microCcdAmount || 0n,
        [accountInfo?.accountAmount.microCcdAmount]
    );
    const identityName = useIdentityName(account, 'Unknown');

    return (
        <div className={clsx('main-layout__header-list-item', checked && 'main-layout__header-list-item--checked')}>
            <div className="main-layout__header-list-item__primary">
                <div className="flex align-center">
                    {/* TODO add account name */}
                    {displaySplitAddress(account.address)}{' '}
                    {selected && <CheckmarkIcon className="main-layout__header-list-item__check" />}
                </div>
                {accountInfo && <BakerOrDelegatorIcon accountInfo={accountInfo} className="absolute r-25" />}
                <CopyButton
                    className="absolute r-0"
                    value={account.address}
                    onMouseUp={(e) => e.stopPropagation()}
                    tabIndex={-1}
                />
            </div>
            <div className="main-layout__header-list-item__secondary">{identityName}</div>
            <div className="main-layout__header-list-item__secondary mono">{displayAsCcd(totalBalance)}</div>
        </div>
    );
}

type Props = ClassName & {
    onSelect(): void;
};

const AccountList = forwardRef<HTMLDivElement, Props>(({ className, onSelect }, ref) => {
    const accounts = useAtomValue(credentialsAtom);
    const [selectedAccount, setSelectedAccount] = useAtom(selectedAccountAtom);
    const nav = useNavigate();
    const { t } = useTranslation('mainLayout');

    return (
        <EntityList<WalletCredential>
            className={className}
            onSelect={(a) => {
                setSelectedAccount(a.address);
                onSelect();
            }}
            onNew={() => nav(absoluteRoutes.home.account.add.path)}
            entities={accounts}
            getKey={(a) => a.address}
            newText={t('accountList.new')}
            ref={ref}
            searchableKeys={['address']}
        >
            {(a, checked) => <AccountListItem account={a} checked={checked} selected={a.address === selectedAccount} />}
        </EntityList>
    );
});

export default AccountList;

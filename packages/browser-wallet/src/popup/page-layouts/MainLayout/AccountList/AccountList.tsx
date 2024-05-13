import React, { forwardRef, KeyboardEventHandler, useCallback, useMemo, useState } from 'react';
import clsx from 'clsx';
import { useAtom, useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { ClassName, displayAsCcd } from 'wallet-common-helpers';
import CopyButton from '@popup/shared/CopyButton';
import CheckmarkIcon from '@assets/svg/checkmark-blue.svg';
import EditIcon from '@assets/svg/edit-secondary.svg';
import BakerIcon from '@assets/svg/validator.svg';
import DelegationIcon from '@assets/svg/delegation.svg';
import { absoluteRoutes } from '@popup/constants/routes';
import { credentialsAtom, selectedAccountAtom } from '@popup/store/account';
import { useTranslation } from 'react-i18next';
import {
    displayNameOrSplitAddress,
    useIdentityName,
    useWritableSelectedAccount,
} from '@popup/shared/utils/account-helpers';
import { WalletCredential } from '@shared/storage/types';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext';
import { AccountInfo, isBakerAccount, isDelegatorAccount } from '@concordium/web-sdk';
import IconButton from '@popup/shared/IconButton';
import { InlineInput } from '@popup/shared/Form/InlineInput';
import EntityList from '../EntityList';

const ACCOUNT_NAME_MAX_LENGTH = 12;

const useEditableAccountName = (account: WalletCredential) => {
    const setAccount = useWritableSelectedAccount(account.address);
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(displayNameOrSplitAddress(account));

    const handleSubmitName = useCallback(() => {
        if (isEditing) {
            setAccount({ credName: name } as WalletCredential);
            setIsEditing(false);
        }
    }, [name]);

    const keyHandlerEnter: KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmitName();
        }
    };

    return [
        () => (
            <div role="none">
                {isEditing ? (
                    <InlineInput
                        name="name"
                        onChange={setName}
                        value={name}
                        onKeyUp={keyHandlerEnter}
                        onMouseUp={(e) => e.stopPropagation()}
                        autoFocus
                        maxLength={ACCOUNT_NAME_MAX_LENGTH}
                    />
                ) : (
                    displayNameOrSplitAddress(account)
                )}
            </div>
        ),
        () => (
            <IconButton
                className="entity-list-item__edit absolute r-0"
                onMouseUp={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleSubmitName();
                    setIsEditing(!isEditing);
                }}
            >
                {isEditing ? <CheckmarkIcon /> : <EditIcon />}
            </IconButton>
        ),
    ];
};

export type Account = { address: string };

type ItemProps = {
    account: WalletCredential;
    checked: boolean;
    selected: boolean;
};

function BakerOrDelegatorIcon({ accountInfo, className }: { accountInfo: AccountInfo; className: string }) {
    if (isDelegatorAccount(accountInfo)) {
        return <DelegationIcon width="70" className={className} />;
    }
    if (isBakerAccount(accountInfo)) {
        return <BakerIcon width="66" className={className} />;
    }
    return null;
}

function AccountListItem({ account, checked, selected }: ItemProps) {
    const accountInfo = useAccountInfo(account);
    const [EditableName, EditNameIcon] = useEditableAccountName(account);
    const totalBalance = useMemo(
        () => accountInfo?.accountAmount?.microCcdAmount || 0n,
        [accountInfo?.accountAmount.microCcdAmount]
    );
    const identityName = useIdentityName(account, 'Unknown');

    return (
        <div className={clsx('main-layout__header-list-item', checked && 'main-layout__header-list-item--checked')}>
            <div className="main-layout__header-list-item__primary">
                <div className="flex align-center">
                    <EditableName /> {selected && <CheckmarkIcon className="main-layout__header-list-item__check" />}
                </div>
                {accountInfo && <BakerOrDelegatorIcon accountInfo={accountInfo} className="absolute r-25" />}
                <CopyButton
                    className="absolute r-0"
                    value={account.address}
                    onMouseUp={(e) => e.stopPropagation()}
                    tabIndex={-1}
                />
                <EditNameIcon />
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
            searchableKeys={['address', 'credName']}
        >
            {(a, checked) => <AccountListItem account={a} checked={checked} selected={a.address === selectedAccount} />}
        </EntityList>
    );
});

export default AccountList;

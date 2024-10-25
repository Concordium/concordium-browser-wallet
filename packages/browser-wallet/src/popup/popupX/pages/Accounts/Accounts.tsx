import React, { ChangeEvent, KeyboardEvent, useState } from 'react';
import Plus from '@assets/svgX/plus.svg';
import Arrows from '@assets/svgX/arrows-down-up.svg';
import MagnifyingGlass from '@assets/svgX/magnifying-glass.svg';
import Pencil from '@assets/svgX/pencil-simple.svg';
import Checkmark from '@assets/svgX/checkmark.svg';
import Close from '@assets/svgX/close.svg';
import Copy from '@assets/svgX/copy.svg';
import ArrowRight from '@assets/svgX/arrow-right.svg';
import Page from '@popup/popupX/shared/Page';
import Button from '@popup/popupX/shared/Button';
import { useTranslation } from 'react-i18next';
import Card from '@popup/popupX/shared/Card';
import Text from '@popup/popupX/shared/Text';
import { useNavigate } from 'react-router-dom';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import { copyToClipboard } from '@popup/popupX/shared/utils/helpers';
import { useAtomValue } from 'jotai';
import { credentialsAtom } from '@popup/store/account';
import { WalletCredential } from '@shared/storage/types';
import { displaySplitAddress, useIdentityName, useWritableSelectedAccount } from '@popup/shared/utils/account-helpers';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext';
import { displayAsCcd } from 'wallet-common-helpers';

type EditableAccountNameProps = {
    currentName: string;
    fallbackName: string;
    onNewName: (newName: string) => void;
};

function EditableAccountName({ currentName, fallbackName, onNewName }: EditableAccountNameProps) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState(currentName);
    // Using editedName instead of currentName to avoid flickering after completing.
    const displayName = editedName === '' ? fallbackName : editedName;
    const onAbort = () => {
        setIsEditingName(false);
        setEditedName(currentName);
    };
    const onComplete = () => {
        onNewName(editedName.trim());
        setIsEditingName(false);
    };
    const onEdit = () => {
        setEditedName(currentName);
        setIsEditingName(true);
    };
    const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setEditedName(event.target.value);
    };
    const onKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            onComplete();
        }
    };
    if (isEditingName) {
        return (
            <>
                <Text.Main>
                    <input
                        autoFocus
                        className="editable"
                        value={editedName}
                        placeholder={fallbackName}
                        onChange={onInputChange}
                        onKeyUp={onKeyUp}
                        maxLength={25}
                    />
                </Text.Main>
                <div className="row gap-16">
                    <Button.Icon
                        className="transparent"
                        icon={<Checkmark className="width-12" />}
                        onClick={onComplete}
                    />
                    <Button.Icon className="transparent" icon={<Close className="width-16" />} onClick={onAbort} />
                </div>
            </>
        );
    }
    return (
        <>
            <Text.Main>{displayName}</Text.Main>
            <Button.Icon className="transparent" icon={<Pencil />} onClick={onEdit} />
        </>
    );
}

type AccountListItemProps = {
    credential: WalletCredential;
};

function AccountListItem({ credential }: AccountListItemProps) {
    const { t } = useTranslation('x', { keyPrefix: 'accounts' });
    const nav = useNavigate();
    const navToPrivateKey = () => nav(absoluteRoutes.settings.accounts.privateKey.path);
    const navToConnectedSites = () => nav(absoluteRoutes.settings.accounts.connectedSites.path);
    const navToIdCards = () => nav(absoluteRoutes.settings.idCards.path);
    const identityName = useIdentityName(credential);
    const accountInfo = useAccountInfo(credential);
    const setAccount = useWritableSelectedAccount(credential.address);
    const fallbackName = displaySplitAddress(credential.address);
    const accountName = credential.credName !== '' ? credential.credName : fallbackName;
    const { address } = credential;
    const ccdBalance =
        accountInfo === undefined ? 'Loading' : displayAsCcd(accountInfo.accountAmount.microCcdAmount, false);
    const onNewAccountName = (newName: string) => setAccount({ credName: newName });
    return (
        <Card key={accountName}>
            <Card.Row>
                <EditableAccountName
                    currentName={accountName}
                    onNewName={onNewAccountName}
                    fallbackName={fallbackName}
                />
            </Card.Row>
            <Card.Row>
                <Text.Capture className="wrap-anywhere">{address}</Text.Capture>
                <Button.Icon className="transparent" onClick={() => copyToClipboard(address)} icon={<Copy />} />
            </Card.Row>
            <Card.Row>
                <Text.MainRegular>{t('ccdBalance')}</Text.MainRegular>
                <Text.MainMedium>{ccdBalance}</Text.MainMedium>
            </Card.Row>
            <Card.Row>
                <Text.MainRegular>{t('connectedSites')}</Text.MainRegular>
                <Button.IconText
                    className="transparent"
                    onClick={navToConnectedSites}
                    label={t('seeList')}
                    icon={<ArrowRight />}
                    leftLabel
                />
            </Card.Row>
            <Card.Row>
                <Text.MainRegular>{t('privateKey')}</Text.MainRegular>
                <Button.IconText
                    className="transparent"
                    onClick={navToPrivateKey}
                    label={t('export')}
                    icon={<ArrowRight />}
                    leftLabel
                />
            </Card.Row>
            <Card.Row>
                <Text.MainRegular>{t('attachedTo')}</Text.MainRegular>
                <Button.IconText
                    className="transparent"
                    onClick={navToIdCards}
                    label={identityName}
                    icon={<ArrowRight />}
                    leftLabel
                />
            </Card.Row>
        </Card>
    );
}

export default function Accounts() {
    const { t } = useTranslation('x', { keyPrefix: 'accounts' });
    const accounts = useAtomValue(credentialsAtom);
    return (
        <Page className="accounts-x">
            <Page.Top heading={t('accounts')}>
                <Button.Icon icon={<Arrows />} />
                <Button.Icon icon={<MagnifyingGlass />} />
                <Button.Icon icon={<Plus />} />
            </Page.Top>
            <Page.Main>
                {accounts.map((item) => (
                    <AccountListItem credential={item} key={item.address} />
                ))}
            </Page.Main>
        </Page>
    );
}

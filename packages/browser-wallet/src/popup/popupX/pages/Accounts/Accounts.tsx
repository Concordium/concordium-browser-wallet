import React, { useCallback, useMemo, useState } from 'react';
import Plus from '@assets/svgX/plus.svg';
import Arrows from '@assets/svgX/arrows-down-up.svg';
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
import { generatePath, useNavigate } from 'react-router-dom';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import { useAtomValue } from 'jotai';
import { credentialsAtom } from '@popup/store/account';
import { WalletCredential } from '@shared/storage/types';
import { displaySplitAddress, useIdentityName, useWritableSelectedAccount } from '@popup/shared/utils/account-helpers';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext';
import { displayAsCcd } from 'wallet-common-helpers';
import useEditableValue from '@popup/popupX/shared/EditableValue';
import { useCopyAddress } from '@popup/popupX/shared/utils/hooks';
import appTracker from '@shared/analytics';

function compareAsc(left: WalletCredential, right: WalletCredential): number {
    if (left.credName === '' && right.credName !== '') {
        return 1;
    }
    if (right.credName === '' && left.credName !== '') {
        return -1;
    }
    return left.credName?.localeCompare(right.credName) || left.address?.localeCompare(right.address);
}

function compareDesc(left: WalletCredential, right: WalletCredential): number {
    return compareAsc(right, left);
}

type AccountListItemProps = {
    credential: WalletCredential;
};

function AccountListItem({ credential }: AccountListItemProps) {
    const { t } = useTranslation('x', { keyPrefix: 'accounts' });
    const nav = useNavigate();
    const copyAddressToClipboard = useCopyAddress();
    const navToPrivateKey = () =>
        nav(generatePath(absoluteRoutes.settings.accounts.privateKey.path, { account: credential.address }));
    const navToConnectedSites = () =>
        nav(generatePath(absoluteRoutes.settings.accounts.connectedSites.path, { account: credential.address }));
    const navToIdCards = () => nav(absoluteRoutes.settings.identities.path);
    const identityName = useIdentityName(credential);
    const accountInfo = useAccountInfo(credential);
    const setAccount = useWritableSelectedAccount(credential.address);
    const fallbackName = displaySplitAddress(credential.address);
    const accountName = credential.credName !== '' ? credential.credName : fallbackName;
    const { address } = credential;
    const ccdBalance =
        accountInfo === undefined ? 'Loading' : displayAsCcd(accountInfo.accountAmount.microCcdAmount, false);
    const onNewAccountName = (newName: string) => setAccount({ credName: newName });
    const editable = useEditableValue(accountName, fallbackName, onNewAccountName);

    return (
        <Card key={accountName}>
            <Card.Row>
                <Text.Main>{editable.value}</Text.Main>
                {editable.isEditing ? (
                    <div className="row gap-16">
                        <Button.Icon
                            className="transparent"
                            icon={<Checkmark className="width-12" />}
                            onClick={editable.onComplete}
                        />
                        <Button.Icon
                            className="transparent"
                            icon={<Close className="width-16" />}
                            onClick={editable.onAbort}
                        />
                    </div>
                ) : (
                    <Button.Icon className="transparent" icon={<Pencil />} onClick={editable.onEdit} />
                )}
            </Card.Row>
            <Card.Row>
                <Text.Capture className="wrap-anywhere">{address}</Text.Capture>
                <Button.Icon className="transparent" onClick={() => copyAddressToClipboard(address)} icon={<Copy />} />
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
    const [ascSort, setAscSort] = useState(true);
    const accounts = useAtomValue(credentialsAtom);
    const nav = useNavigate();
    const navToCreateAccount = useCallback(() => nav(absoluteRoutes.settings.createAccount.path), []);
    const sorted = useMemo(
        () => accounts.filter((c) => c.address).sort(ascSort ? compareAsc : compareDesc),
        [accounts, ascSort]
    );

    return (
        <Page className="accounts-x">
            <Page.Top heading={t('accounts')}>
                <Button.Icon icon={<Arrows />} onClick={() => setAscSort((a) => !a)} />
                <Button.Icon
                    icon={<Plus />}
                    onClick={() => {
                        appTracker.homeCreateAccountClicked();
                        navToCreateAccount();
                    }}
                />
            </Page.Top>
            <Page.Main>
                {sorted.map((item) => (
                    <AccountListItem credential={item} key={item.address} />
                ))}
            </Page.Main>
        </Page>
    );
}

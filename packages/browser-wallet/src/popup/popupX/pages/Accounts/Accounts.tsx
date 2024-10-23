import React from 'react';
import Plus from '@assets/svgX/plus.svg';
import Arrows from '@assets/svgX/arrows-down-up.svg';
import MagnifyingGlass from '@assets/svgX/magnifying-glass.svg';
import Pencil from '@assets/svgX/pencil-simple.svg';
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
import { useIdentityName } from '@popup/shared/utils/account-helpers';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext';
import { displayAsCcd } from 'wallet-common-helpers';

function fallbackAccountName(credentialNumber: number): string {
    return `Account ${1 + credentialNumber}`;
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

    const accountName = credential.credName !== '' ? credential.credName : fallbackAccountName(credential.credNumber);
    const { address } = credential;
    const ccdBalance =
        accountInfo === undefined ? 'Loading' : displayAsCcd(accountInfo.accountAmount.microCcdAmount, false);
    return (
        <Card key={accountName}>
            <Card.Row>
                <Text.Main>{accountName}</Text.Main>
                <Button.Icon className="transparent" icon={<Pencil />} />
            </Card.Row>
            <Card.Row>
                <Text.Capture>{address}</Text.Capture>
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

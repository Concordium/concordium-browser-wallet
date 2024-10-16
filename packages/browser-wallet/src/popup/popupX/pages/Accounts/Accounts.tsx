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

const ACCOUNT_LIST = [
    {
        account: 'Account 1',
        address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        balance: '4,227.38',
        attached: 'Identity 1',
    },
    {
        account: 'Account 2',
        address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        balance: '4,227.38',
        attached: 'Identity 1',
    },
    {
        account: 'Account 3',
        address: 'tt2kgdygjrsqtzq2n0yrf2493p83kkfjh50eo',
        balance: '1,195.41',
        attached: 'Identity 2',
    },
];

export default function Accounts() {
    const { t } = useTranslation('x', { keyPrefix: 'accounts' });
    const nav = useNavigate();
    const navToPrivateKey = () => nav(absoluteRoutes.settings.accounts.privateKey.path);
    const navToConnectedSites = () => nav(absoluteRoutes.settings.accounts.connectedSites.path);
    const navToIdCards = () => nav(absoluteRoutes.settings.idCards.path);
    return (
        <Page className="accounts-x">
            <Page.Top heading={t('accounts')}>
                <Button.Icon icon={<Arrows />} />
                <Button.Icon icon={<MagnifyingGlass />} />
                <Button.Icon icon={<Plus />} />
            </Page.Top>
            <Page.Main>
                {ACCOUNT_LIST.map(({ account, address, balance, attached }) => (
                    <Card key={account}>
                        <Card.Row>
                            <Text.Main>{account}</Text.Main>
                            <Button.Icon className="transparent" icon={<Pencil />} />
                        </Card.Row>
                        <Card.Row>
                            <Text.Capture>{address}</Text.Capture>
                            <Button.Icon
                                className="transparent"
                                onClick={() => copyToClipboard(address)}
                                icon={<Copy />}
                            />
                        </Card.Row>
                        <Card.Row>
                            <Text.MainRegular>{t('totalBalance')}</Text.MainRegular>
                            <Text.MainMedium>{balance} USD</Text.MainMedium>
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
                                label={attached}
                                icon={<ArrowRight />}
                                leftLabel
                            />
                        </Card.Row>
                    </Card>
                ))}
            </Page.Main>
        </Page>
    );
}

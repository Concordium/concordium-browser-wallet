import React from 'react';
import Plus from '@assets/svgX/plus.svg';
import Button from '@popup/popupX/shared/Button';
import Page from '@popup/popupX/shared/Page';
import { useTranslation } from 'react-i18next';
import IdCard from '@popup/popupX/shared/IdCard';

const rowsIdInfo = [
    ['Identity document type', 'Drivers licence'],
    ['Identity document number', 'BXM680515'],
    ['First name', 'Lewis'],
    ['Last name', 'Hamilton'],
    ['Date of birth', '13 August 1992'],
    ['Identity document issuer', 'New Zeland'],
    ['ID valid until', '30 October 2051'],
];

const rowsConnectedAccounts = [
    ['Accout 1 / 6gk...Fk7o', '4,227.38 USD'],
    ['Accout 2 / tt2...50eo', '1,195.41 USD'],
    ['Accout 3 / bnh...JJ76', '123.38 USD'],
    ['Accout 4 / rijf...8h7T', '7,200.41 USD'],
];
export default function IdCards() {
    const { t } = useTranslation('x', { keyPrefix: 'idCards' });
    return (
        <Page className="id-cards-x">
            <Page.Top heading={t('idCards')}>
                <Button.Icon icon={<Plus />} />
            </Page.Top>
            <Page.Main>
                <IdCard rowsIdInfo={rowsIdInfo} rowsConnectedAccounts={rowsConnectedAccounts} />
            </Page.Main>
        </Page>
    );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Arrow from '@assets/svgX/arrow-right.svg';
import FileText from '@assets/svgX/file-text.svg';
import Notebook from '@assets/svgX/notebook.svg';
import Eye from '@assets/svgX/eye-slash.svg';
import { relativeRoutes } from '@popup/popupX/constants/routes';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import Button from '@popup/popupX/shared/Button';
import { useTranslation } from 'react-i18next';
import Card from '@popup/popupX/shared/Card';

export default function TokenDetails() {
    const { t } = useTranslation('x', { keyPrefix: 'tokenDetails' });

    const nav = useNavigate();
    const navToSend = () => nav(`../${relativeRoutes.home.send.path}`);
    const navToReceive = () => nav(`../${relativeRoutes.home.receive.path}`);
    const navToTransactionLog = () => nav(`../${relativeRoutes.home.transactionLog.path}`);
    return (
        <Page className="token-details-x">
            <Page.Main>
                <Text.HeadingBig> 5500 CCd</Text.HeadingBig>
                <div className="token-details-x__action-buttons">
                    <Button.IconTile
                        icon={<Arrow />}
                        label={t('receive')}
                        onClick={() => navToReceive()}
                        className="receive"
                    />
                    <Button.IconTile icon={<Arrow />} label={t('send')} onClick={() => navToSend()} className="send" />
                    <Button.IconTile
                        icon={<FileText />}
                        label={t('transactions')}
                        onClick={() => navToTransactionLog()}
                    />
                </div>
                <Card>
                    <Card.RowDetails
                        title={t('description')}
                        value="EURe is the native token of the Concordium blockchain.Its main use cases are the payment of transaction fees, the payment for the execution of smart contracts, payments between users, payments for commercial transactions, staking, and the rewards offered to node operators."
                    />
                    <Card.RowDetails title={t('decimals')} value="0-8" />
                    <Card.RowDetails title={t('indexSubindex')} value="123,1" />
                </Card>
                <Button.IconText icon={<Notebook />} label={t('showRawMetadata')} />
                <Button.IconText icon={<Eye />} label={t('hideToken')} />
            </Page.Main>
        </Page>
    );
}

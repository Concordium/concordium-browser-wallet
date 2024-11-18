import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AccountInfoType } from '@concordium/web-sdk';
import { relativeRoutes, absoluteRoutes } from '@popup/popupX/constants/routes';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import Button from '@popup/popupX/shared/Button';
import Card from '@popup/popupX/shared/Card';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext';
import { displayAsCcd, getPublicAccountAmounts, PublicAccountAmounts } from 'wallet-common-helpers';
import { WalletCredential } from '@shared/storage/types';
import { withSelectedCredential } from '@popup/popupX/shared/utils/hoc';
import Arrow from '@assets/svgX/arrow-right.svg';
import FileText from '@assets/svgX/file-text.svg';
import Plant from '@assets/svgX/plant.svg';

const zeroBalance: Omit<PublicAccountAmounts, 'scheduled'> = {
    total: 0n,
    staked: 0n,
    atDisposal: 0n,
    cooldown: 0n,
};

function useCcdInfo(credential: WalletCredential) {
    const { t } = useTranslation('x', { keyPrefix: 'tokenDetails' });
    const [balances, setBalances] = useState<Omit<PublicAccountAmounts, 'scheduled'>>(zeroBalance);
    const accountInfo = useAccountInfo(credential);

    useEffect(() => {
        if (!accountInfo) {
            setBalances(zeroBalance);
        } else {
            setBalances(getPublicAccountAmounts(accountInfo));
        }
    }, [accountInfo]);

    type AccountTypeMap = { [TYPE in AccountInfoType]: string };

    const tokenDetails = useMemo(() => {
        if (accountInfo) {
            const type: AccountTypeMap = {
                [AccountInfoType.Delegator]: t('delegated'),
                [AccountInfoType.Baker]: t('validated'),
                [AccountInfoType.Simple]: '',
            };
            return {
                total: displayAsCcd(balances.total, false, true),
                atDisposal: displayAsCcd(balances.atDisposal, false, true),
                staked: displayAsCcd(balances.staked, false, true),
                cooldown: displayAsCcd(balances.cooldown, false, true),
                type: type[accountInfo.type],
            };
        }
        return { total: null, atDisposal: null };
    }, [balances]);

    return tokenDetails;
}

function TokenDetailsCcd({ credential }: { credential: WalletCredential }) {
    const { t } = useTranslation('x', { keyPrefix: 'tokenDetails' });

    const tokenDetails = useCcdInfo(credential);

    const nav = useNavigate();
    const navToSend = () => nav(`../${relativeRoutes.home.sendFunds.path}`);
    const navToReceive = () => nav(`../${relativeRoutes.home.receive.path}`);
    const navToTransactionLog = () => nav(`../${relativeRoutes.home.transactionLog.path}`);
    const navToEarn = () => nav(absoluteRoutes.settings.earn.path);

    return (
        <Page className="token-details-x">
            <Page.Main>
                <Text.HeadingBig>{tokenDetails.total}</Text.HeadingBig>
                <div className="token-details-x__stake">
                    <div className="token-details-x__stake_group">
                        <Text.Capture>{t('atDisposal')}</Text.Capture>
                        <Text.CaptureAdditional>{tokenDetails.atDisposal}</Text.CaptureAdditional>
                    </div>
                    {tokenDetails.type && (
                        <div className="token-details-x__stake_group">
                            <Text.Capture>{tokenDetails.type}</Text.Capture>
                            <Text.CaptureAdditional>{tokenDetails.staked}</Text.CaptureAdditional>
                        </div>
                    )}
                    <div className="token-details-x__stake_group">
                        <Text.Capture>{t('cooldown')}</Text.Capture>
                        <Text.CaptureAdditional>{tokenDetails.cooldown}</Text.CaptureAdditional>
                    </div>
                </div>
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
                    <Button.IconTile icon={<Plant />} label={t('earn')} onClick={() => navToEarn()} />
                </div>
                <Card>
                    <Card.RowDetails title={t('description')} value={t('ccdDescription')} />
                    <Card.RowDetails title={t('decimals')} value="0 – 6" />
                </Card>
            </Page.Main>
        </Page>
    );
}

export default withSelectedCredential(TokenDetailsCcd);

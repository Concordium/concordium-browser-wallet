import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AccountAddress } from '@concordium/web-sdk';
import { relativeRoutes, absoluteRoutes, sendFundsRoute } from '@popup/popupX/constants/routes';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import Button from '@popup/popupX/shared/Button';
import Card from '@popup/popupX/shared/Card';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext';
import { displayAsCcd, getPublicAccountAmounts, PublicAccountAmounts } from 'wallet-common-helpers';
import { WalletCredential } from '@shared/storage/types';
import { withSelectedCredential } from '@popup/popupX/shared/utils/hoc';
import Arrow from '@assets/svgX/arrow-right.svg';
import Clock from '@assets/svgX/clock.svg';
import Percent from '@assets/svgX/percent.svg';
import ConcordiumLogo from '@assets/svgX/concordium-logo.svg';
import { TokenPickerVariant } from '@popup/popupX/shared/Form/TokenAmount/View';

const zeroBalance: Omit<PublicAccountAmounts, 'scheduled'> = {
    total: 0n,
    staked: 0n,
    atDisposal: 0n,
    cooldown: 0n,
};

function useCcdInfo(credential: WalletCredential) {
    const [balances, setBalances] = useState<Omit<PublicAccountAmounts, 'scheduled'>>(zeroBalance);
    const accountInfo = useAccountInfo(credential);

    useEffect(() => {
        if (!accountInfo) {
            setBalances(zeroBalance);
        } else {
            setBalances(getPublicAccountAmounts(accountInfo));
        }
    }, [accountInfo]);

    const tokenDetails = useMemo(() => {
        if (accountInfo) {
            return {
                total: displayAsCcd(balances.total, false, true),
                atDisposal: displayAsCcd(balances.atDisposal, false, true),
                staked: displayAsCcd(balances.staked, false, true),
                cooldown: displayAsCcd(balances.cooldown, false, true),
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
    const navToSend = () =>
        nav(sendFundsRoute(AccountAddress.fromBase58(credential.address)), {
            state: { tokenType: 'ccd' } as TokenPickerVariant,
        });
    const navToReceive = () => nav(`../${relativeRoutes.home.receive.path}`);
    const navToTransactionLog = () => nav(`../${relativeRoutes.home.transactionLog.path}`);
    const navToEarn = () => nav(absoluteRoutes.settings.earn.path);

    return (
        <Page className="token-details-x">
            <Page.Main>
                <Text.DynamicSize baseFontSize={32} baseTextLength={17} className="heading_big">
                    {tokenDetails.total}
                </Text.DynamicSize>
                <div className="token-details-x__stake">
                    <div className="token-details-x__stake_group">
                        <Text.Capture>{t('earning')}</Text.Capture>
                        <Text.CaptureAdditional>{tokenDetails.staked}</Text.CaptureAdditional>
                    </div>
                    <div className="token-details-x__stake_group">
                        <Text.Capture>{t('cooldown')}</Text.Capture>
                        <Text.CaptureAdditional>{tokenDetails.cooldown}</Text.CaptureAdditional>
                    </div>
                    <div className="token-details-x__stake_group">
                        <Text.Capture>{t('atDisposal')}</Text.Capture>
                        <Text.CaptureAdditional>{tokenDetails.atDisposal}</Text.CaptureAdditional>
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
                    <Button.IconTile icon={<Percent />} label={t('earn')} onClick={() => navToEarn()} />
                    <Button.IconTile icon={<Clock />} label={t('activity')} onClick={() => navToTransactionLog()} />
                </div>
                <Card>
                    <div className="token-details-x__token">
                        <ConcordiumLogo />
                        <Text.Main>CCD</Text.Main>
                    </div>
                    <Card.RowDetails title={t('description')} value={t('ccdDescription')} />
                    <Card.RowDetails title={t('decimals')} value="0 – 6" />
                </Card>
            </Page.Main>
        </Page>
    );
}

export default withSelectedCredential(TokenDetailsCcd);

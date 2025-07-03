import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AccountAddress, Ratio } from '@concordium/web-sdk';
import { absoluteRoutes, sendFundsRoute } from '@popup/popupX/constants/routes';
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
import Plus from '@assets/svgX/plus.svg';
import ConcordiumLogo from '@assets/svgX/concordium-logo.svg';
import { TokenPickerVariant } from '@popup/popupX/shared/Form/TokenAmount/View';
import { displayCcdAsEur } from '@popup/popupX/shared/utils/helpers';
import { useBlockChainParameters } from '@popup/shared/BlockChainParametersProvider';

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
                total: balances.total,
                atDisposal: balances.atDisposal,
                staked: balances.staked,
                cooldown: balances.cooldown,
            };
        }
        return { total: null, atDisposal: null };
    }, [balances]);

    return tokenDetails;
}

function TokenExchange({ microCcdPerEur, balanceBase }: { microCcdPerEur?: Ratio; balanceBase?: bigint }) {
    const isNoExchange = microCcdPerEur === undefined || balanceBase === undefined;

    return isNoExchange ? null : (
        <div className="token-balance__exchange-rate">
            <Text.Capture>{displayCcdAsEur(microCcdPerEur, balanceBase, 2)}</Text.Capture>
        </div>
    );
}

function TokenDetailsCcd({ credential }: { credential: WalletCredential }) {
    const { t } = useTranslation('x', { keyPrefix: 'tokenDetails' });

    const tokenDetails = useCcdInfo(credential);

    const chainParameters = useBlockChainParameters();
    const microCcdPerEur = chainParameters?.microGTUPerEuro;

    const nav = useNavigate();
    const navToSend = () =>
        nav(sendFundsRoute(AccountAddress.fromBase58(credential.address)), {
            state: { tokenType: 'ccd' } as TokenPickerVariant,
        });
    const navToReceive = () => nav(absoluteRoutes.home.receive.path);
    const navToBuy = () => nav(absoluteRoutes.home.onramp.path);
    const navToTransactionLog = () =>
        nav(absoluteRoutes.home.transactionLog.path.replace(':account', credential.address));
    const navToEarn = () => nav(absoluteRoutes.settings.earn.path);

    const hasStake = tokenDetails.staked !== undefined && tokenDetails.staked > 0n;
    const hasCooldown = tokenDetails.cooldown !== undefined && tokenDetails.cooldown > 0n;
    const showAtDisposal = tokenDetails.atDisposal !== null && tokenDetails.atDisposal !== tokenDetails.total;

    return (
        <Page className="token-details-x">
            <Page.Main>
                <Text.DynamicSize baseFontSize={32} baseTextLength={17} className="heading_big">
                    {tokenDetails.total !== null && displayAsCcd(tokenDetails.total, false, true)}
                </Text.DynamicSize>
                <TokenExchange microCcdPerEur={microCcdPerEur} balanceBase={tokenDetails.total ?? undefined} />
                {(hasStake || hasCooldown || showAtDisposal) && (
                    <div className="token-details-x__stake">
                        {hasStake && (
                            <div className="token-details-x__stake_group">
                                <Text.Capture>{t('earning')}</Text.Capture>
                                <Text.CaptureAdditional>
                                    {displayAsCcd(tokenDetails.staked, false, true)}
                                </Text.CaptureAdditional>
                            </div>
                        )}
                        {hasCooldown && (
                            <div className="token-details-x__stake_group">
                                <Text.Capture>{t('cooldown')}</Text.Capture>
                                <Text.CaptureAdditional>
                                    {displayAsCcd(tokenDetails.cooldown, false, true)}
                                </Text.CaptureAdditional>
                            </div>
                        )}
                        {showAtDisposal && (
                            <div className="token-details-x__stake_group">
                                <Text.Capture>{t('atDisposal')}</Text.Capture>
                                <Text.CaptureAdditional>
                                    {displayAsCcd(tokenDetails.atDisposal, false, true)}
                                </Text.CaptureAdditional>
                            </div>
                        )}
                    </div>
                )}
                <div className="token-details-x__action-buttons">
                    <Button.IconTile icon={<Plus />} label={t('buy')} onClick={navToBuy} className="buy" />
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

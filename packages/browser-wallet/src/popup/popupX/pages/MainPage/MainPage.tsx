import React, { ReactNode, useMemo } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { displayAsCcd } from 'wallet-common-helpers';
import { AccountInfoType, Ratio } from '@concordium/web-sdk';
import { absoluteRoutes, relativeRoutes } from '@popup/popupX/constants/routes';
import Img from '@popup/shared/Img';
import { ConfirmedCredential, CreationStatus, WalletCredential } from '@shared/storage/types';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext';
import { useFlattenedAccountTokens } from '@popup/pages/Account/Tokens/utils';
import { getMetadataUnique } from '@shared/utils/token-helpers';
import { contractBalancesFamily } from '@popup/store/token';
import { useBlockChainParameters } from '@popup/shared/BlockChainParametersProvider';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import Button from '@popup/popupX/shared/Button';
import { withSelectedCredential } from '@popup/popupX/shared/utils/hoc';
import Arrow from '@assets/svgX/arrow-right.svg';
import FileText from '@assets/svgX/file-text.svg';
import ConcordiumLogo from '@assets/svgX/concordium-logo.svg';
import Plant from '@assets/svgX/plant.svg';
import Gear from '@assets/svgX/gear.svg';
import { formatTokenAmount } from '@popup/popupX/shared/utils/helpers';

/** Hook loading every fungible token added to the account. */
function useAccountFungibleTokens(account: WalletCredential) {
    const tokens = useFlattenedAccountTokens(account);
    return tokens.filter((t) => !getMetadataUnique(t.metadata));
}

/** Hook for loading the CIS-2 token balance of some account. */
function useAccountTokenBalance(accountAddress: string, contractAddress: string, tokenId: string) {
    const { [tokenId]: balance } = useAtomValue(contractBalancesFamily(accountAddress, contractAddress));
    return balance;
}

type TokenBalanceProps = { decimals?: number; tokenId: string; contractAddress: string; accountAddress: string };
/** Component for fetching and displaying a CIS-2 token balance of an account. */
function AccountTokenBalance({ decimals, tokenId, contractAddress, accountAddress }: TokenBalanceProps) {
    const balanceRaw = useAccountTokenBalance(accountAddress, contractAddress, tokenId) ?? 0n;
    const balance = useMemo(() => formatTokenAmount(balanceRaw, decimals), [balanceRaw]);
    return <span>{balance}</span>;
}

/** Convert and display an amount of CCD to EUR using an exchange rate. */
function displayCcdAsEur(microCcdPerEur: Ratio, microCcd: bigint, decimals: number, eurPostfix?: boolean) {
    const eur = Number(microCcdPerEur.denominator * microCcd) / Number(microCcdPerEur.numerator);
    const eurFormatter = new Intl.NumberFormat(undefined, {
        style: eurPostfix ? undefined : 'currency',
        currency: 'EUR',
        maximumFractionDigits: decimals,
    });
    if (eurPostfix) {
        return `${eurFormatter.format(eur)} EUR`;
    }

    return eurFormatter.format(eur);
}

function Balance({ credential }: { credential: WalletCredential }) {
    const chainParameters = useBlockChainParameters();
    const microCcdPerEur = chainParameters?.microGTUPerEuro;
    const accountInfo = useAccountInfo(credential);

    if (!accountInfo) {
        return null;
    }

    const ccdBalance = displayAsCcd(accountInfo.accountAmount.microCcdAmount, false, true);
    const eurBalance =
        microCcdPerEur && displayCcdAsEur(microCcdPerEur, accountInfo.accountAmount.microCcdAmount, 2, true);

    return (
        <div className="main-page-x__balance">
            <Text.HeadingLarge>{microCcdPerEur ? eurBalance : ccdBalance}</Text.HeadingLarge>
            <Text.Capture>{microCcdPerEur ? ccdBalance : ''}</Text.Capture>
        </div>
    );
}

type TokenItemProps = {
    thumbnail: string | ReactNode;
    symbol: string;
    balance: string | ReactNode;
    balanceBase?: bigint;
    staked?: boolean;
    microCcdPerEur?: Ratio;
    onClick: () => void;
};
function TokenItem({ thumbnail, symbol, balance, balanceBase, staked, microCcdPerEur, onClick }: TokenItemProps) {
    const isNoExchange = microCcdPerEur === undefined || balanceBase === undefined;
    return (
        <Button.Base onClick={onClick} className="main-page-x__tokens-list_item">
            <div className="token-icon">
                {typeof thumbnail === 'string' ? <Img src={thumbnail} alt={symbol} withDefaults /> : thumbnail}
            </div>
            <div className="token-balance">
                <div className="token-balance__amount">
                    <Text.Label>{symbol}</Text.Label>
                    {staked && <Plant />}
                    <Text.Label>{balance}</Text.Label>
                </div>
                {isNoExchange ? null : (
                    <div className="token-balance__exchange-rate">
                        <Text.Capture>{displayCcdAsEur(microCcdPerEur, 1000000n, 6)}</Text.Capture>
                        <Text.Capture>{displayCcdAsEur(microCcdPerEur, balanceBase, 2)}</Text.Capture>
                    </div>
                )}
            </div>
        </Button.Base>
    );
}

type MainPageConfirmedAccountProps = { credential: ConfirmedCredential };

function MainPageConfirmedAccount({ credential }: MainPageConfirmedAccountProps) {
    const { t } = useTranslation('x', { keyPrefix: 'mainPage' });

    const nav = useNavigate();
    const navToSend = () => nav(generatePath(absoluteRoutes.home.sendFunds.path, { account: credential.address }));
    const navToReceive = () => nav(relativeRoutes.home.receive.path);
    const navToTransactionLog = () =>
        nav(relativeRoutes.home.transactionLog.path.replace(':account', credential.address));
    const navToTokenDetails = (contractIndex: string) =>
        nav(absoluteRoutes.home.token.details.path.replace(':contractIndex', contractIndex));

    const navToManageToken = () => nav(relativeRoutes.home.manageTokenList.path);

    const chainParameters = useBlockChainParameters();
    const microCcdPerEur = chainParameters?.microGTUPerEuro;
    const accountInfo = useAccountInfo(credential);
    const tokens = useAccountFungibleTokens(credential);

    if (accountInfo === undefined) {
        return <>Loading</>;
    }

    const isStaked = [AccountInfoType.Delegator, AccountInfoType.Baker].includes(accountInfo.type);

    return (
        <Page className="main-page-x">
            <Balance credential={credential} />
            <div className="main-page-x__action-buttons">
                <Button.IconTile icon={<Arrow />} label={t('receive')} onClick={navToReceive} className="receive" />
                <Button.IconTile icon={<Arrow />} label={t('send')} onClick={navToSend} className="send" />
                <Button.IconTile icon={<FileText />} label={t('transactions')} onClick={navToTransactionLog} />
            </div>
            <div className="main-page-x__tokens">
                <div className="main-page-x__tokens-list">
                    <TokenItem
                        onClick={() => nav(absoluteRoutes.home.token.ccd.path)}
                        thumbnail={<ConcordiumLogo />}
                        symbol="CCD"
                        staked={isStaked}
                        balance={displayAsCcd(accountInfo.accountAmount.microCcdAmount, false)}
                        balanceBase={accountInfo.accountAmount.microCcdAmount}
                        microCcdPerEur={microCcdPerEur}
                    />
                    {tokens.map((token) => (
                        <TokenItem
                            onClick={() => navToTokenDetails(token.contractIndex)}
                            key={`${token.contractIndex}.${token.id}`}
                            thumbnail={token.metadata.thumbnail?.url || ''}
                            symbol={token.metadata.symbol || ''}
                            balance={
                                <AccountTokenBalance
                                    decimals={token.metadata.decimals}
                                    contractAddress={token.contractIndex}
                                    accountAddress={credential.address}
                                    tokenId={token.id}
                                />
                            }
                        />
                    ))}
                    <Button.IconText onClick={navToManageToken} icon={<Gear />} label={t('manageTokenList')} />
                </div>
            </div>
        </Page>
    );
}

function MainPagePendingAccount() {
    const { t } = useTranslation('x', { keyPrefix: 'mainPage' });
    const nav = useNavigate();
    return (
        <Page className="main-page-x">
            <div className="main-page-x__balance">
                <Text.HeadingLarge>{t('pendingAccount')}</Text.HeadingLarge>
                <Text.Capture>{t('pendingSubText')}</Text.Capture>
            </div>
            <div className="main-page-x__action-buttons">
                <Button.IconTile icon={<Arrow />} label={t('receive')} disabled className="receive" />
                <Button.IconTile icon={<Arrow />} label={t('send')} disabled className="send" />
                <Button.IconTile icon={<FileText />} label={t('transactions')} disabled />
            </div>
            <div className="main-page-x__tokens">
                <div className="main-page-x__tokens-list">
                    <TokenItem
                        onClick={() => nav(absoluteRoutes.home.token.ccd.path)}
                        thumbnail={<ConcordiumLogo />}
                        symbol="CCD"
                        balance={displayAsCcd(0n, false)}
                        balanceBase={0n}
                    />
                    <Button.IconText disabled icon={<Gear />} label={t('manageTokenList')} />
                </div>
            </div>
        </Page>
    );
}

type MainPageProps = { credential: WalletCredential };

function MainPage({ credential }: MainPageProps) {
    switch (credential.status) {
        case CreationStatus.Confirmed:
            return <MainPageConfirmedAccount credential={credential} />;
        case CreationStatus.Pending:
            return <MainPagePendingAccount />;
        case CreationStatus.Rejected:
            return <>Account Creation was rejected</>;
        default:
            throw new Error(`Unexpected status for credential: ${credential.status}`);
    }
}

export default withSelectedCredential(MainPage);

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import IconButton from '@popup/popupX/shared/IconButton';
import Arrow from '@assets/svgX/arrow-right.svg';
import FileText from '@assets/svgX/file-text.svg';
import ConcordiumLogo from '@assets/svgX/concordium-logo.svg';
import Plant from '@assets/svgX/plant.svg';
import { relativeRoutes } from '@popup/popupX/constants/routes';
import Page from '@popup/popupX/shared/Page';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext';
import { useSelectedCredential } from '@popup/shared/utils/account-helpers';
import { WalletCredential } from '@shared/storage/types';
import { displayAsCcd } from 'wallet-common-helpers';
import { useFlattenedAccountTokens } from '@popup/pages/Account/Tokens/utils';
import { getMetadataUnique } from '@shared/utils/token-helpers';
import Img from '@popup/shared/Img';
import { contractBalancesFamily } from '@popup/store/token';
import { useAtomValue } from 'jotai';
import { useBlockChainParameters } from '@popup/shared/BlockChainParametersProvider';
import { Ratio } from '@concordium/web-sdk';

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

/** Display a token balance with a number of decimals. Localized. */
function formatBalance(balance: bigint, decimals: number = 0) {
    const padded = balance.toString().padStart(decimals + 1, '0');
    const integer = padded.slice(0, -decimals);
    const fraction = padded.slice(-decimals);
    const balanceFormatter = new Intl.NumberFormat(undefined, { minimumFractionDigits: decimals });
    // @ts-ignore format below supports strings, TypeScript is just not aware.
    return balanceFormatter.format(`${integer}.${fraction}`);
}

type TokenBalanceProps = { decimals?: number; tokenId: string; contractAddress: string; accountAddress: string };
/** Component for fetching and displaying a CIS-2 token balance of an account. */
function AccountTokenBalance({ decimals, tokenId, contractAddress, accountAddress }: TokenBalanceProps) {
    const balanceRaw = useAccountTokenBalance(accountAddress, contractAddress, tokenId) ?? 0n;
    const balance = useMemo(() => formatBalance(balanceRaw, decimals), [balanceRaw]);
    return balance;
}

/** Convert and display an amount of CCD to EUR using an exchange rate. */
function displayCcdAsEur(microCcdPerEur: Ratio, microCcd: bigint, decimals: number) {
    const eur = Number(microCcdPerEur.denominator * microCcd) / Number(microCcdPerEur.numerator);
    const eurFormatter = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: decimals,
    });
    return eurFormatter.format(eur);
}

type MainPageProps = { credential: WalletCredential };
function MainPage({ credential }: MainPageProps) {
    const nav = useNavigate();
    const navToSend = () => nav(relativeRoutes.home.send.path);
    const navToReceive = () => nav(relativeRoutes.home.receive.path);
    const navToTransactionLog = () =>
        nav(relativeRoutes.home.transactionLog.path.replace(':account', credential.address));
    const navToTokenDetails = () => nav(relativeRoutes.home.token.path);

    const chainParameters = useBlockChainParameters();
    const microCcdPerEur = chainParameters?.microGTUPerEuro;
    const accountInfo = useAccountInfo(credential);
    const tokens = useAccountFungibleTokens(credential);
    if (accountInfo === undefined) {
        return <>Loading</>;
    }

    return (
        <Page className="main-page-container">
            <div className="main-page__balance">
                {microCcdPerEur === undefined ? (
                    <span className="heading_large">{displayAsCcd(accountInfo.accountAmount.microCcdAmount)}</span>
                ) : (
                    <>
                        <span className="heading_large">
                            {displayCcdAsEur(microCcdPerEur, accountInfo.accountAmount.microCcdAmount, 2)}
                        </span>
                        <span className="capture__main_small">
                            {displayAsCcd(accountInfo.accountAmount.microCcdAmount)}
                        </span>
                    </>
                )}
            </div>
            <div className="main-page__action-buttons">
                <IconButton className="send" onClick={() => navToSend()}>
                    <Arrow />
                    <span className="capture__additional_small">Send</span>
                </IconButton>
                <IconButton className="receive" onClick={() => navToReceive()}>
                    <Arrow />
                    <span className="capture__additional_small">Receive</span>
                </IconButton>
                <IconButton onClick={() => navToTransactionLog()}>
                    <FileText />
                    <span className="capture__additional_small">Transactions</span>
                </IconButton>
            </div>
            <div className="main-page__tokens">
                <div className="main-page__tokens-list">
                    <div className="main-page__tokens-list_item" onClick={() => navToTokenDetails()}>
                        <div className="token-icon">
                            <ConcordiumLogo />
                        </div>
                        <div className="token-balance">
                            <div className="token-balance__amount">
                                <span className="label__main">CCD</span>
                                <Plant />
                                <span className="label__main">
                                    {displayAsCcd(accountInfo.accountAmount.microCcdAmount)}
                                </span>
                            </div>
                            {microCcdPerEur === undefined ? null : (
                                <div className="token-balance__exchange-rate">
                                    <span className="capture__main_small">
                                        {displayCcdAsEur(microCcdPerEur, 1000000n, 6)}
                                    </span>
                                    <span className="capture__main_small">
                                        {displayCcdAsEur(microCcdPerEur, accountInfo.accountAmount.microCcdAmount, 6)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    {tokens.map((token) => (
                        <div
                            className="main-page__tokens-list_item"
                            onClick={() => navToTokenDetails()}
                            key={`${token.contractIndex}.${token.id}`}
                        >
                            <div className="token-icon">
                                <Img src={token.metadata.thumbnail?.url} alt={token.metadata.name} withDefaults />
                            </div>
                            <div className="token-balance">
                                <div className="token-balance__amount">
                                    <span className="label__main">{token.metadata.symbol}</span>
                                    <span className="label__main">
                                        <AccountTokenBalance
                                            decimals={token.metadata.decimals}
                                            contractAddress={token.contractIndex}
                                            accountAddress={credential.address}
                                            tokenId={token.id}
                                        />
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Page>
    );
}

export default function Loader() {
    const credential = useSelectedCredential();
    if (credential === undefined) {
        return <>Loading</>;
    }
    return <MainPage credential={credential} />;
}

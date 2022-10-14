import React, { Suspense, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { displayAsCcd, toFraction, addThousandSeparators } from 'wallet-common-helpers';
import { Atom, useAtomValue } from 'jotai';

import { absoluteRoutes } from '@popup/constants/routes';
import TabBar from '@popup/shared/TabBar';
import PlusIcon from '@assets/svg/plus.svg';
import CcdIcon from '@assets/svg/concordium.svg';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext';
import { useSelectedCredential } from '@popup/shared/utils/account-helpers';
import { TokenIdAndMetadata, WalletCredential } from '@shared/storage/types';
import { tokenBalanceFamily, tokensAtom } from '@popup/store/token';
import Button from '@popup/shared/Button';
import { ftDetailsRoute, nftDetailsRoute } from '@popup/shared/utils/route-helpers';

import { tokensRoutes } from './routes';

type BalanceProps = {
    atom: Atom<Promise<bigint>>;
    decimals: number;
};

function Balance({ atom, decimals }: BalanceProps) {
    const balance = useAtomValue(atom);
    const getFraction = toFraction(10 ** decimals);
    const renderBalance = (value: bigint) => addThousandSeparators(getFraction(value));

    return <>{renderBalance(balance)}</>;
}

type FtProps = {
    accountAddress: string;
    contractIndex: string;
    token: TokenIdAndMetadata;
    onClick(): void;
};

function Ft({ accountAddress, contractIndex: contractAddress, token, onClick }: FtProps) {
    const balanceAtom = tokenBalanceFamily(accountAddress, contractAddress, token.id);

    return (
        <Button clear className="token-list__item" onClick={onClick}>
            <img className="token-list__icon" src={token.metadata.thumbnail?.url} alt={token.metadata.name} />
            {/* TODO should only show symbol for FTs, remove name fallback when NFTs work */}
            <Suspense fallback={<>...</>}>
                <Balance atom={balanceAtom} decimals={token.metadata.decimals ?? 0} />
            </Suspense>{' '}
            {token.metadata.symbol || token.metadata.name || ''}
        </Button>
    );
}

function useTokens(account: WalletCredential, unique: boolean) {
    const {
        loading,
        value: { [account.address]: tokens },
    } = useAtomValue(tokensAtom);
    const items = useMemo(
        () =>
            loading || tokens === undefined
                ? []
                : Object.entries(tokens).flatMap(([contractIndex, ts]) => ts.map((t) => ({ contractIndex, ...t }))),
        [tokens, loading]
    );

    return items.filter((t) => (t.metadata.unique ?? false) === unique);
}

type ListProps = {
    account: WalletCredential;
};

function Fungibles({ account }: ListProps) {
    const accountInfo = useAccountInfo(account);
    const nav = useNavigate();
    const tokens = useTokens(account, false);

    if (accountInfo === undefined) {
        return null;
    }

    const handleClick = (contractIndex: string, id: string) => () => {
        nav(ftDetailsRoute(contractIndex, id));
    };

    return (
        <>
            <Button clear className="token-list__item">
                <CcdIcon className="token-list__icon token-list__icon--ccd" />
                <div className="token-list__balance">{displayAsCcd(accountInfo.accountAmount)} CCD</div>
            </Button>
            {tokens.map((t) => (
                <Ft
                    key={`${t.contractIndex}.${t.id}`}
                    accountAddress={account.address}
                    contractIndex={t.contractIndex}
                    token={t}
                    onClick={handleClick(t.contractIndex, t.id)}
                />
            ))}
        </>
    );
}

function Collectibles({ account }: ListProps) {
    const nav = useNavigate();
    const tokens = useTokens(account, true);

    const handleClick = (contractIndex: string, id: string) => () => {
        nav(nftDetailsRoute(contractIndex, id));
    };

    return (
        <>
            {tokens.map((t) => (
                <Button
                    clear
                    key={`${t.contractIndex}.${t.id}`}
                    onClick={handleClick(t.contractIndex, t.id)}
                    className="token-list__item"
                >
                    <img className="token-list__icon" src={t.metadata.thumbnail?.url ?? ''} alt={t.metadata.name} />
                    <div>{t.metadata.name}</div>
                </Button>
            ))}
        </>
    );
}

function TokensOverview() {
    const { t } = useTranslation('account');
    return (
        <div className="tokens">
            <TabBar className="tokens__actions">
                <TabBar.Item className="tokens__link" to="" end>
                    {t('tokens.tabBar.ft')}
                </TabBar.Item>
                <TabBar.Item className="tokens__link" to={tokensRoutes.collectibles}>
                    {t('tokens.tabBar.nft')}
                </TabBar.Item>
                <TabBar.Item className="tokens__link" to={absoluteRoutes.home.account.tokens.add.path}>
                    <div className="tokens__add">
                        {t('tokens.tabBar.new')}
                        <PlusIcon />
                    </div>
                </TabBar.Item>
            </TabBar>
            <div className="tokens__scroll">
                <Outlet />
            </div>
        </div>
    );
}

export default function Main() {
    const account = useSelectedCredential();

    if (account === undefined) {
        return null;
    }

    return (
        <Routes>
            <Route element={<TokensOverview />}>
                <Route index element={<Fungibles account={account} />} />
                <Route path={tokensRoutes.collectibles} element={<Collectibles account={account} />} />
            </Route>
        </Routes>
    );
}
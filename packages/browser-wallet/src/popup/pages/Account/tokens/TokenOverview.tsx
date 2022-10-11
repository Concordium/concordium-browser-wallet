import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, Route, Routes } from 'react-router-dom';
import { displayAsCcd, toFraction, addThousandSeparators } from 'wallet-common-helpers';
import { useAtomValue } from 'jotai';

import { absoluteRoutes } from '@popup/constants/routes';
import TabBar from '@popup/shared/TabBar';
import PlusIcon from '@assets/svg/plus.svg';
import CcdIcon from '@assets/svg/concordium.svg';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext';
import { useSelectedCredential } from '@popup/shared/utils/account-helpers';
import { TokenIdAndMetadata, WalletCredential } from '@shared/storage/types';
import { tokensAtom } from '@popup/store/account';
import Button from '@popup/shared/Button';

import { tokensRoutes } from './routes';

type FtProps = {
    accountAddress: string;
    contractAddress: string;
    token: TokenIdAndMetadata;
    onClick(): void;
};

function Ft({ accountAddress, contractAddress, token, onClick }: FtProps) {
    const balance = useMemo(
        () => (token.metadata.decimals ? 1254000001n : 1n), // TODO get balance from token contract
        [accountAddress, contractAddress, token.metadata.decimals]
    );
    const getFraction = toFraction(10 ** (token.metadata.decimals ?? 0));
    const renderBalance = (value: bigint) => addThousandSeparators(getFraction(value));

    return (
        <Button clear className="token-list__item" onClick={onClick}>
            <img className="token-list__icon" src={token.metadata.thumbnail?.url} alt={token.metadata.name} />
            {/* TODO should only show symbol for FTs, remove name fallback when NFTs work */}
            <div>{`${renderBalance(balance)} ${token.metadata.symbol || token.metadata.name || ''}`}</div>
        </Button>
    );
}

type ListProps = {
    account: WalletCredential;
};

function Fungibles({ account }: ListProps) {
    const accountInfo = useAccountInfo(account);
    const {
        loading,
        value: { [account.address]: tokens },
    } = useAtomValue(tokensAtom);
    const items = useMemo(
        () =>
            loading || tokens === undefined
                ? []
                : Object.entries(tokens).flatMap(([address, ts]) => ts.map((t) => ({ address, ...t }))),
        [tokens, loading]
    );

    if (accountInfo === undefined || loading || tokens === undefined) {
        return null;
    }

    const handleClick = (token: TokenIdAndMetadata) => () => {
        // eslint-disable-next-line no-console
        console.log(token);
    };

    return (
        <>
            <Button clear className="token-list__item">
                <CcdIcon className="token-list__icon" />
                <div className="token-list__balance">{displayAsCcd(accountInfo.accountAmount)} CCD</div>
            </Button>
            {items.map((i) => (
                <Ft
                    key={i.id}
                    accountAddress={account.address}
                    contractAddress={i.address}
                    token={i}
                    onClick={handleClick(i)}
                />
            ))}
        </>
    );
}

// FIXME
function Collectibles() {
    const items = [1, 2, 3, 4];
    return (
        <>
            {items.map((i) => (
                <Button clear key={i} className="token-list__item">
                    <img className="token-list__icon" src="/resources/icons/32x32.png" alt="icon" />
                    <div>Example NFT</div>
                </Button>
            ))}
        </>
    );
}

function TokensOverview() {
    const { t } = useTranslation('account');
    return (
        <div className="tokens-overview">
            <TabBar className="tokens-overview__actions">
                <TabBar.Item className="tokens-overview__link" to="" end>
                    {t('tokens.tabBar.ft')}
                </TabBar.Item>
                <TabBar.Item className="tokens-overview__link" to={tokensRoutes.collectibles}>
                    {t('tokens.tabBar.nft')}
                </TabBar.Item>
                <TabBar.Item className="tokens-overview__link" to={absoluteRoutes.home.account.tokens.add.path}>
                    <div className="tokens-overview__add">
                        {t('tokens.tabBar.new')}
                        <PlusIcon />
                    </div>
                </TabBar.Item>
            </TabBar>
            <div className="tokens-overview__scroll">
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
                <Route path={tokensRoutes.collectibles} element={<Collectibles />} />
            </Route>
        </Routes>
    );
}

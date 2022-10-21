import React, { ReactNode, useMemo } from 'react';
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
import { contractBalancesFamily, tokensAtom } from '@popup/store/token';
import Button from '@popup/shared/Button';

import AtomValue from '@popup/store/AtomValue';
import { tokensRoutes } from './routes';

type BalanceProps = {
    balance: bigint;
    decimals: number;
    children?(balance: bigint): ReactNode;
};

function Balance({ balance, decimals, children }: BalanceProps) {
    const getFraction = toFraction(10 ** decimals);
    const renderBalance = children ?? ((value: bigint) => addThousandSeparators(getFraction(value)));

    return <>{renderBalance(balance)}</>;
}

type FtProps = {
    accountAddress: string;
    contractIndex: string;
    token: TokenIdAndMetadata;
};

function Ft({ accountAddress, contractIndex: contractAddress, token }: FtProps) {
    const { [token.id]: balance } = useAtomValue(contractBalancesFamily(accountAddress, contractAddress));

    return (
        <Button clear className="token-list__item">
            <img className="token-list__icon" src={token.metadata.thumbnail?.url} alt={token.metadata.name} />
            <Balance balance={balance} decimals={token.metadata.decimals ?? 0} />{' '}
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
    const tokens = useTokens(account, false);

    if (accountInfo === undefined) {
        return null;
    }

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
                />
            ))}
        </>
    );
}

function Collectibles({ account }: ListProps) {
    const tokens = useTokens(account, true);
    const { t } = useTranslation('account', { keyPrefix: 'tokens' });

    return (
        <>
            {tokens.map((token) => (
                <Button clear key={`${token.contractIndex}.${token.id}`} className="token-list__item">
                    <img
                        className="token-list__icon"
                        src={token.metadata.thumbnail?.url ?? ''}
                        alt={token.metadata.name}
                    />
                    <div className="token-list__unique-name">
                        {token.metadata.name}
                        <AtomValue atom={contractBalancesFamily(account.address, token.contractIndex)}>
                            {({ [token.id]: b }) =>
                                b === 0n && <div className="token-list__not-owned text-faded">{t('unownedUnique')}</div>
                            }
                        </AtomValue>
                    </div>
                </Button>
            ))}
        </>
    );
}

function TokensOverview() {
    const { t } = useTranslation('account', { keyPrefix: 'tokens.tabBar' });
    return (
        <div className="tokens">
            <TabBar className="tokens__actions">
                <TabBar.Item className="tokens__link" to="" end>
                    {t('ft')}
                </TabBar.Item>
                <TabBar.Item className="tokens__link" to={tokensRoutes.collectibles}>
                    {t('nft')}
                </TabBar.Item>
                <TabBar.Item className="tokens__link" to={absoluteRoutes.home.account.tokens.add.path}>
                    <div className="tokens__add">
                        {t('new')}
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
    useAtomValue(tokensAtom); // Ensure tokens are kept in memory

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

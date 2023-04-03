import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { displayAsCcd } from 'wallet-common-helpers';
import { useAtomValue } from 'jotai';

import TabBar from '@popup/shared/TabBar';
import CcdIcon from '@assets/svg/concordium.svg';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext';
import { useSelectedCredential } from '@popup/shared/utils/account-helpers';
import { TokenIdAndMetadata, WalletCredential } from '@shared/storage/types';
import { contractBalancesFamily } from '@popup/store/token';
import Button from '@popup/shared/Button';
import TokenBalance from '@popup/shared/TokenBalance';
import AtomValue from '@popup/store/AtomValue';
import { getMetadataDecimals, getMetadataUnique, ownsOne } from '@shared/utils/token-helpers';
import { CCD_METADATA } from '@shared/constants/token-metadata';
import Img from '@popup/shared/Img';
import { tokensRoutes, detailsRoute } from './routes';
import TokenDetails from './TokenDetails';
import { AccountTokenDetails, useFlattenedAccountTokens } from './utils';
import ManageTokens from './ManageTokens';

type FtProps = {
    accountAddress: string;
    contractIndex: string;
    token: TokenIdAndMetadata;
    onClick(): void;
};

function Ft({ accountAddress, contractIndex: contractAddress, token, onClick }: FtProps) {
    const { [token.id]: balance } = useAtomValue(contractBalancesFamily(accountAddress, contractAddress));

    return (
        <Button clear className="token-list__item" onClick={onClick}>
            <Img
                className="token-list__icon"
                src={token.metadata.thumbnail?.url}
                alt={token.metadata.name}
                withDefaults
            />
            <div>
                <div className="token-list__name">{token.metadata.name ?? token.metadata.symbol ?? ''}</div>
                <div className="token-list__balance">
                    <TokenBalance
                        balance={balance}
                        decimals={getMetadataDecimals(token.metadata)}
                        symbol={token.metadata.symbol}
                    />
                </div>
            </div>
        </Button>
    );
}

function useFilteredTokens(account: WalletCredential, unique: boolean) {
    const tokens = useFlattenedAccountTokens(account);
    return tokens.filter((t) => getMetadataUnique(t.metadata) === unique);
}

const MANAGE_MESSAGE_THRESHOLD = 3; // ~ when list goes from static to scrollable.

type AddTokensDescriptionProps = {
    tokens: AccountTokenDetails[];
};

function AddTokensDescription({ tokens }: AddTokensDescriptionProps) {
    const { t } = useTranslation('account', { keyPrefix: 'tokens' });

    const listStateText = useMemo(() => {
        if (tokens.length === 0) {
            return t('listEmpty');
        }
        if (tokens.length < MANAGE_MESSAGE_THRESHOLD) {
            return t('listAddMore');
        }

        return undefined;
    }, [tokens]);

    if (listStateText === undefined) {
        return null;
    }

    return <div className="token-list__add-more-text">{listStateText}</div>;
}

type ListProps = {
    account: WalletCredential;
    toDetails: (contractIndex: string, id: string) => void;
};

function Fungibles({ account, toDetails }: ListProps) {
    const accountInfo = useAccountInfo(account);
    const tokens = useFilteredTokens(account, false);

    if (accountInfo === undefined) {
        return null;
    }

    return (
        <>
            <div className="token-list__item token-list__item--nft">
                <CcdIcon className="token-list__icon token-list__icon--ccd" />
                <div>
                    <div className="token-list__name">{CCD_METADATA.name}</div>
                    <div className="token-list__balance">{displayAsCcd(accountInfo.accountAmount)} CCD</div>
                </div>
            </div>
            {tokens.map((token) => (
                <Ft
                    key={`${token.contractIndex}.${token.id}`}
                    accountAddress={account.address}
                    contractIndex={token.contractIndex}
                    token={token}
                    onClick={() => toDetails(token.contractIndex, token.id)}
                />
            ))}
            <AddTokensDescription tokens={tokens} />
        </>
    );
}

function Collectibles({ account, toDetails }: ListProps) {
    const tokens = useFilteredTokens(account, true);
    const { t } = useTranslation('account', { keyPrefix: 'tokens' });

    return (
        <>
            {tokens.map(({ contractIndex, id, metadata }) => (
                <Button
                    clear
                    key={`${contractIndex}.${id}`}
                    onClick={() => toDetails(contractIndex, id)}
                    className="token-list__item"
                >
                    <Img
                        className="token-list__icon"
                        src={metadata.thumbnail?.url ?? metadata.display?.url}
                        alt={metadata.name}
                        withDefaults
                    />
                    <div>
                        <div className="token-list__name">{metadata.name}</div>
                        <AtomValue atom={contractBalancesFamily(account.address, contractIndex)}>
                            {({ [id]: b }) => (
                                <>
                                    {b === 0n && <div className="token-list__balance">{t('unownedUnique')}</div>}
                                    {b && !ownsOne(b, getMetadataDecimals(metadata)) && (
                                        <div className="token-list__balance">
                                            <TokenBalance
                                                balance={b}
                                                decimals={getMetadataDecimals(metadata)}
                                                symbol={metadata.symbol}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </AtomValue>
                    </div>
                </Button>
            ))}
            <AddTokensDescription tokens={tokens} />
        </>
    );
}

function Tokens() {
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
                <TabBar.Item className="tokens__link" to={tokensRoutes.manage}>
                    <div className="tokens__add">{t('manage')}</div>
                </TabBar.Item>
            </TabBar>
            <div className="tokens__scroll">
                <Outlet />
            </div>
        </div>
    );
}

export default function TokensRoutes() {
    const account = useSelectedCredential();
    const nav = useNavigate();

    if (account === undefined) {
        return null;
    }

    const goToDetails = (contractIndex: string, id: string) => {
        nav(detailsRoute(contractIndex, id));
    };

    return (
        <Routes>
            <Route path={tokensRoutes.details} element={<TokenDetails />} />
            <Route element={<Tokens />}>
                <Route index element={<Fungibles account={account} toDetails={goToDetails} />} />
                <Route
                    path={tokensRoutes.collectibles}
                    element={<Collectibles account={account} toDetails={goToDetails} />}
                />
                <Route path={`${tokensRoutes.manage}/*`} element={<ManageTokens />} />
            </Route>
        </Routes>
    );
}

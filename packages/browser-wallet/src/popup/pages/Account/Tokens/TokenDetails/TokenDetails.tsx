import React, { ReactNode, Suspense, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useSelectedCredential } from '@popup/shared/utils/account-helpers';
import { contractBalancesFamily } from '@popup/store/token';
import CloseButton from '@popup/shared/CloseButton';
import { ContractBalances } from '@shared/utils/token-helpers';
import { Atom } from 'jotai';
import { useTranslation } from 'react-i18next';
import TokenBalance from '../TokenBalance';
import { defaultCis2TokenId } from '../routes';
import { TokenDetails, useTokens } from '../utils';

const SUB_INDEX = 0;

type TokenDetailsLineProps = {
    header: string;
    children: ReactNode | undefined;
};

function TokenDetailsLine({ header, children }: TokenDetailsLineProps) {
    if (!children && children !== 0) {
        return null;
    }

    return (
        <div className="token-details__line">
            <div className="token-details__line-header">{header}</div>
            <div>{children}</div>
        </div>
    );
}

type TokenProps = {
    token: TokenDetails;
    balancesAtom: Atom<Promise<ContractBalances>>;
};

function Nft({ token, balancesAtom }: TokenProps) {
    const { thumbnail, name, decimals = 0, description, display } = token.metadata;
    const { t } = useTranslation('account', { keyPrefix: 'tokens' });

    return (
        <>
            <h3 className="token-details__header">
                {thumbnail && <img src={thumbnail.url} alt={`${name} thumbnail`} />}
                {name}
            </h3>
            <TokenDetailsLine header={t('details.ownership')}>
                <Suspense fallback="">
                    <TokenBalance atom={balancesAtom} decimals={decimals ?? 0} id={token.id}>
                        {(b) => <span className="text-bold">{b === 0n ? t('unownedUnique') : t('ownedUnique')}</span>}
                    </TokenBalance>
                </Suspense>
            </TokenDetailsLine>
            <TokenDetailsLine header={t('details.description')}>{description}</TokenDetailsLine>
            <TokenDetailsLine header={t('details.contractIndex')}>
                {token.contractIndex}, {SUB_INDEX}
            </TokenDetailsLine>
            <img className="token-details__image" src={display?.url} alt={name} />
        </>
    );
}

function Ft({ token, balancesAtom }: TokenProps) {
    const { thumbnail, name, decimals = 0, description, symbol } = token.metadata;
    const { t } = useTranslation('account', { keyPrefix: 'tokens.details' });
    return (
        <>
            <h3 className="token-details__header">
                {thumbnail && <img src={thumbnail.url} alt={`${name} thumbnail`} />}
                {name}
            </h3>
            <TokenDetailsLine header={t('balance')}>
                <div className="mono text-bold">
                    <Suspense fallback="0">
                        <TokenBalance atom={balancesAtom} decimals={decimals} id={token.id} />
                    </Suspense>{' '}
                    {symbol}
                </div>
            </TokenDetailsLine>
            <TokenDetailsLine header={t('description')}>{description}</TokenDetailsLine>
            <TokenDetailsLine header={t('decimals')}>{decimals}</TokenDetailsLine>
            <TokenDetailsLine header={t('contractIndex')}>
                {token.contractIndex}, {SUB_INDEX}
            </TokenDetailsLine>
        </>
    );
}

type TokenDetailsRouteParams = {
    contractIndex: string;
    id: string;
};

function useTokenDetails(): TokenDetails | undefined {
    const account = useSelectedCredential();
    const { contractIndex, id } = useParams<TokenDetailsRouteParams>();
    const tokenId = useMemo(() => (id === defaultCis2TokenId ? '' : id), [id]);
    const tokens = useTokens(account);

    return tokens.find((t) => t.contractIndex === contractIndex && t.id === tokenId);
}

type Props = {
    setDetailsExpanded(expanded: boolean): void;
};

export default function Details({ setDetailsExpanded }: Props) {
    const token = useTokenDetails();
    const nav = useNavigate();
    const account = useSelectedCredential();
    const balancesAtom = contractBalancesFamily(account?.address ?? '', token?.contractIndex ?? '');

    useEffect(() => {
        setDetailsExpanded(false);
        return () => setDetailsExpanded(true);
    }, []);

    if (token === undefined) {
        return null;
    }

    const Token = token.metadata.unique ? Nft : Ft;

    return (
        <div className="token-details">
            <CloseButton className="token-details__close" onClick={() => nav(-1)} />
            <Token token={token} balancesAtom={balancesAtom} />
        </div>
    );
}

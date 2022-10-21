import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useSelectedCredential } from '@popup/shared/utils/account-helpers';
import { contractBalancesFamily, removeTokenFromCurrentAccountAtom } from '@popup/store/token';
import CloseButton from '@popup/shared/CloseButton';
import { useTranslation } from 'react-i18next';
import Button from '@popup/shared/Button';
import { useUpdateAtom } from 'jotai/utils';
import { absoluteRoutes } from '@popup/constants/routes';
import AtomValue from '@popup/store/AtomValue';
import Modal from '@popup/shared/Modal';
import ButtonGroup from '@popup/shared/ButtonGroup';
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
    balance: bigint;
};

function Nft({ token, balance }: TokenProps) {
    const { thumbnail, name, description, display } = token.metadata;
    const { t } = useTranslation('account', { keyPrefix: 'tokens' });

    return (
        <>
            <h3 className="token-details__header">
                {thumbnail && <img src={thumbnail.url} alt={`${name} thumbnail`} />}
                {name}
            </h3>
            <TokenDetailsLine header={t('details.ownership')}>
                <span className="text-bold">{balance === 0n ? t('unownedUnique') : t('ownedUnique')}</span>
            </TokenDetailsLine>
            <TokenDetailsLine header={t('details.description')}>{description}</TokenDetailsLine>
            <TokenDetailsLine header={t('details.contractIndex')}>
                {token.contractIndex}, {SUB_INDEX}
            </TokenDetailsLine>
            <TokenDetailsLine header={t('tokenId')}>{token.id}</TokenDetailsLine>
            <img className="token-details__image" src={display?.url} alt={name} />
        </>
    );
}

function Ft({ token, balance }: TokenProps) {
    const { thumbnail, name, decimals = 0, description, symbol } = token.metadata;
    const { t } = useTranslation('account', { keyPrefix: 'tokens' });
    return (
        <>
            <h3 className="token-details__header">
                {thumbnail && <img src={thumbnail.url} alt={`${name} thumbnail`} />}
                {name}
            </h3>
            <TokenDetailsLine header={t('details.balance')}>
                <div className="mono text-bold">
                    <TokenBalance balance={balance} decimals={decimals} /> {symbol}
                </div>
            </TokenDetailsLine>
            <TokenDetailsLine header={t('details.description')}>{description}</TokenDetailsLine>
            <TokenDetailsLine header={t('details.decimals')}>{decimals}</TokenDetailsLine>
            <TokenDetailsLine header={t('details.contractIndex')}>
                {token.contractIndex}, {SUB_INDEX}
            </TokenDetailsLine>
            <TokenDetailsLine header={t('tokenId')}>{token.id}</TokenDetailsLine>
        </>
    );
}

type RemoveTokenProps = {
    token: TokenDetails;
};

function RemoveToken({
    token: {
        contractIndex,
        id,
        metadata: { name },
    },
}: RemoveTokenProps) {
    const removeToken = useUpdateAtom(removeTokenFromCurrentAccountAtom);
    const nav = useNavigate();
    const { t } = useTranslation('account', { keyPrefix: 'tokens.details' });
    const [showPrompt, setShowPrompt] = useState(false);

    const remove = () => {
        setShowPrompt(false);
        removeToken({ contractIndex, tokenId: id });
        nav(absoluteRoutes.home.account.path);
    };

    const trigger = (
        <Button clear className="token-details__remove">
            {t('removeToken')}
        </Button>
    );

    return (
        <Modal
            bottom
            trigger={trigger}
            open={showPrompt}
            onOpen={() => setShowPrompt(true)}
            onClose={() => setShowPrompt(false)}
        >
            <h2 className="m-t-0">{t('removePrompt.header', { name: (name && `"${name}"`) || 'token' })}</h2>
            <p className="m-b-20">{t('removePrompt.text')}</p>
            <ButtonGroup>
                <Button faded onClick={() => setShowPrompt(false)}>
                    {t('removePrompt.cancel')}
                </Button>
                <Button danger onClick={remove}>
                    {t('removePrompt.remove')}
                </Button>
            </ButtonGroup>
        </Modal>
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
    const account = useSelectedCredential();
    const nav = useNavigate();
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
            <div className="token-details__content">
                <AtomValue atom={balancesAtom}>{({ [token.id]: b }) => <Token token={token} balance={b} />}</AtomValue>
            </div>
            <RemoveToken token={token} />
        </div>
    );
}

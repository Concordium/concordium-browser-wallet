import React, { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateAtom } from 'jotai/utils';
import { MakeOptional } from 'wallet-common-helpers';

import { removeTokenFromCurrentAccountAtom } from '@popup/store/token';
import CloseButton from '@popup/shared/CloseButton';
import Button from '@popup/shared/Button';
import { absoluteRoutes } from '@popup/constants/routes';
import Modal from '@popup/shared/Modal';
import ButtonGroup from '@popup/shared/ButtonGroup';
import { TokenIdAndMetadata, TokenMetadata } from '@shared/storage/types';

import { useNavigate } from 'react-router-dom';
import { getMetadataDecimals, getMetadataUnique, ownsOne } from '@shared/utils/token-helpers';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '@popup/state';
import TokenBalance from '../TokenBalance';
import Img from '../Img';

const SUB_INDEX = '0';

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

type ShowRawMetadataProps = {
    metadata: TokenMetadata;
};

function ShowRawMetadata({ metadata }: ShowRawMetadataProps) {
    const { t } = useTranslation('shared', { keyPrefix: 'tokenDetails' });
    const [showPrompt, setShowPrompt] = useState(false);

    const trigger = (
        <Button clear className="token-details__show-raw">
            {t('showRawMetadata')}
        </Button>
    );

    return (
        <Modal
            trigger={trigger}
            open={showPrompt}
            onOpen={() => setShowPrompt(true)}
            onClose={() => setShowPrompt(false)}
        >
            <div className="token-details__raw">
                {Object.entries(metadata).map(([k, v]) => (
                    <TokenDetailsLine header={k} key={k}>
                        {JSON.stringify(v)}
                    </TokenDetailsLine>
                ))}
            </div>
        </Modal>
    );
}

type TokenProps = {
    token: TokenIdAndMetadata;
    contractIndex: string;
    subIndex: string;
    balance: bigint | undefined;
};

function Nft({ token, balance, contractIndex, subIndex }: TokenProps) {
    const { thumbnail, name, description, display, symbol } = token.metadata;
    const decimals = getMetadataDecimals(token.metadata);
    const { t } = useTranslation('shared', { keyPrefix: 'tokenDetails' });

    return (
        <>
            <h3 className="token-details__header">
                {thumbnail && <Img src={thumbnail.url} alt={name} withDefaults />}
                {name}
            </h3>
            <TokenDetailsLine header={t('ownership')}>
                <span className="text-bold">{balance === 0n && t('unownedUnique')}</span>
                <span className="text-bold">
                    {balance === 0n || (
                        <>
                            {t('ownedUnique')}
                            {balance && !ownsOne(balance, decimals) && (
                                <>
                                    {' '}
                                    (<TokenBalance balance={balance} decimals={decimals} symbol={symbol} />)
                                </>
                            )}
                        </>
                    )}
                </span>
            </TokenDetailsLine>
            <TokenDetailsLine header={t('description')}>{description}</TokenDetailsLine>
            <TokenDetailsLine header={t('contractIndex')}>
                <>
                    {contractIndex}, {subIndex}
                </>
            </TokenDetailsLine>
            <TokenDetailsLine header={t('tokenId')}>{token.id}</TokenDetailsLine>
            <ShowRawMetadata metadata={token.metadata} />
            {display?.url && (
                <div className="token-details__image">
                    <img src={display?.url} alt={name} />
                </div>
            )}
        </>
    );
}

function Ft({ token, balance, contractIndex, subIndex = SUB_INDEX }: TokenProps) {
    const { thumbnail, name, description, symbol } = token.metadata;
    const decimals = getMetadataDecimals(token.metadata);
    const { t } = useTranslation('shared', { keyPrefix: 'tokenDetails' });

    return (
        <>
            <h3 className="token-details__header">
                {thumbnail && <Img src={thumbnail.url} alt={name} withDefaults />}
                {name}
            </h3>
            <TokenDetailsLine header={t('balance')}>
                <div className="mono text-bold">
                    <TokenBalance balance={balance} decimals={decimals} /> {symbol}
                </div>
            </TokenDetailsLine>
            <TokenDetailsLine header={t('description')}>{description}</TokenDetailsLine>
            <TokenDetailsLine header={t('decimals')}>{decimals}</TokenDetailsLine>
            <TokenDetailsLine header={t('contractIndex')}>
                <>
                    {contractIndex}, {subIndex}
                </>
            </TokenDetailsLine>
            <TokenDetailsLine header={t('tokenId')}>{token.id}</TokenDetailsLine>
            <ShowRawMetadata metadata={token.metadata} />
        </>
    );
}

type RemoveTokenProps = {
    contractIndex: string;
    token: TokenIdAndMetadata;
};

function RemoveToken({
    token: {
        id,
        metadata: { name },
    },
    contractIndex,
}: RemoveTokenProps) {
    const removeToken = useUpdateAtom(removeTokenFromCurrentAccountAtom);
    const nav = useNavigate();
    const { t } = useTranslation('shared', { keyPrefix: 'tokenDetails' });
    const [showPrompt, setShowPrompt] = useState(false);
    const addToast = useSetAtom(addToastAtom);

    const remove = () => {
        setShowPrompt(false);
        removeToken({ contractIndex, tokenId: id });
        addToast(t('tokenRemoved'));
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

type TokenDetailsComponentProps = MakeOptional<TokenProps, 'subIndex'> & {
    canRemove?: boolean;
    onClose: () => void;
};

export default function TokenDetails({
    canRemove = false,
    subIndex = SUB_INDEX,
    onClose,
    ...tokenProps
}: TokenDetailsComponentProps) {
    const { token, contractIndex } = tokenProps;
    const Token = getMetadataUnique(token.metadata) ? Nft : Ft;

    return (
        <div className="token-details">
            <CloseButton className="token-details__close" onClick={onClose} />
            <div className="token-details__content">
                <Token {...tokenProps} subIndex={subIndex} />
            </div>
            {canRemove && <RemoveToken token={token} contractIndex={contractIndex} />}
        </div>
    );
}

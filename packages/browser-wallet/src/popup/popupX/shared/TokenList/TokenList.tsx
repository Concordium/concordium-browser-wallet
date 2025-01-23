import React, { ReactNode } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import Img from '@popup/shared/Img';
import Text from '@popup/popupX/shared/Text';
import { Checkbox } from '@popup/popupX/shared/Form/Checkbox';
import Button from '@popup/popupX/shared/Button/Button';
import { addThousandSeparators, integerToFractional, pipe } from 'wallet-common-helpers';

type TokenListProps = { className?: string; children: ReactNode };

function TokenListRoot({ className, children }: TokenListProps) {
    return <div className={clsx('token-list-x', className)}>{children}</div>;
}

type TokenBalance = {
    amount?: bigint;
    symbol?: string;
    decimals?: number;
};

const useTokenBalance = (balance?: TokenBalance) => {
    if (!balance) return null;
    const { decimals, amount } = balance;
    const renderBalance = pipe(integerToFractional(decimals || 0), addThousandSeparators);
    const result = renderBalance(amount);

    return result;
};

type TokenListItemProps = {
    thumbnail?: string;
    symbol?: string;
    className?: string;
    onClick?: () => void;
};

function TokenListItem({
    thumbnail,
    symbol,
    balance,
    checked,
    disabled,
    className,
    onClick,
    onSelect,
}: TokenListItemProps & {
    onSelect: (checked: boolean) => void;
    disabled?: boolean;
    checked?: boolean;
    balance?: TokenBalance;
}) {
    const { t } = useTranslation('x', { keyPrefix: 'sharedX.tokenList' });
    const amount = useTokenBalance(balance);
    const onCheck = (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
        e.stopPropagation();
        onSelect((e.target as HTMLInputElement).checked);
    };
    return (
        <Button.Base className={clsx('token-list-x__item', className)} onClick={onClick}>
            <div className="token-icon">
                <Img src={thumbnail} alt={symbol} withDefaults />
            </div>
            <div className="token-title">
                <Text.Label>{symbol}</Text.Label>
                {balance && <Text.Capture>{t('balance', { amount, symbol: balance.symbol })}</Text.Capture>}
            </div>

            <Checkbox checked={checked} onClick={onCheck} disabled={disabled} />
        </Button.Base>
    );
}

function TokenListItemHide({ thumbnail, symbol, className, onClick }: TokenListItemProps) {
    const { t } = useTranslation('x', { keyPrefix: 'sharedX.tokenList' });
    return (
        <div className={clsx('token-list-x__item', className)}>
            <div className="token-icon">
                <Img src={thumbnail} alt={symbol} withDefaults />
            </div>
            <Text.Label>{symbol}</Text.Label>
            <Button.Text label={t('hideToken')} onClick={onClick} />
        </div>
    );
}

const TokenList = TokenListRoot as typeof TokenListRoot & {
    Item: typeof TokenListItem;
    ItemHide: typeof TokenListItemHide;
};
TokenList.Item = TokenListItem;
TokenList.ItemHide = TokenListItemHide;

export default TokenList;

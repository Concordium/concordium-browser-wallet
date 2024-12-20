import React, { ReactNode } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import Img from '@popup/shared/Img';
import Text from '@popup/popupX/shared/Text';
import { Checkbox } from '@popup/popupX/shared/Form/Checkbox';
import Button from '@popup/popupX/shared/Button/Button';

type TokenListProps = { className?: string; children: ReactNode };

function TokenListRoot({ className, children }: TokenListProps) {
    return <div className={clsx('token-list-x', className)}>{children}</div>;
}

type TokenListItemProps = { thumbnail?: string; symbol?: string; className?: string; onClick?: () => void };

function TokenListItem({
    thumbnail,
    symbol,
    className,
    onClick,
    onSelect,
}: TokenListItemProps & { onSelect: (checked: boolean) => void }) {
    const onCheck = (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
        e.stopPropagation();
        onSelect((e.target as HTMLInputElement).checked);
    };
    return (
        <Button.Base className={clsx('token-list-x__item', className)} onClick={onClick}>
            <div className="token-icon">
                <Img src={thumbnail} alt={symbol} withDefaults />
            </div>
            <Text.Label>{symbol}</Text.Label>
            <Checkbox onClick={onCheck} />
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

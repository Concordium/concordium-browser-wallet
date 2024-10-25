import React, { ReactNode } from 'react';
import clsx from 'clsx';
import Img from '@popup/shared/Img';
import Text from '@popup/popupX/shared/Text';
import { Checkbox } from '@popup/popupX/shared/Form/Checkbox';

type TokenListProps = { className?: string; children: ReactNode };

function TokenListRoot({ className, children }: TokenListProps) {
    return <div className={clsx('token-list-x', className)}>{children}</div>;
}

type TokenListItemProps = { thumbnail?: string; symbol?: string; className?: string };

function TokenListItem({ thumbnail, symbol, className }: TokenListItemProps) {
    return (
        <div className={clsx('token-list-x__item', className)}>
            <div className="token-icon">
                <Img src={thumbnail} alt={symbol} withDefaults />
            </div>
            <Text.Label>{symbol}</Text.Label>
            <Checkbox />
        </div>
    );
}

const TokenList = TokenListRoot as typeof TokenListRoot & {
    Item: typeof TokenListItem;
};
TokenList.Item = TokenListItem;

export default TokenList;

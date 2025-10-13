import React, { CSSProperties, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { VariableSizeList } from 'react-window';
import clsx from 'clsx';
import { dateFromTimestamp, displayAsCcd, TimeStampUnit } from 'wallet-common-helpers';

import { BrowserWalletTransaction, TransactionStatus } from '@popup/shared/utils/transaction-history-types';
import Button from '@popup/popupX/shared/Button';
import Text from '@popup/popupX/shared/Text';
import Note from '@assets/svgX/note.svg';
import { displaySplitAddressShort } from '@popup/shared/utils/account-helpers';
import DropDown from '@assets/svgX/drop-down.svg';
import TransactionAmount from './TransactionAmount';
import { mapTypeToText, onlyTime } from './util';

const SPACING = 4;
const MEMO_SPACING = 10;
export const TRANSACTION_ELEMENT_HEIGHT = 68; // element height + row spacing = rem(64px) + rem(4px)

interface Props {
    transaction: BrowserWalletTransaction;
    style?: CSSProperties;
    accountAddress: string;
    onClick?: () => void;
    index: number;
    listRef: { current?: VariableSizeList };
    getOpen: (index: number) => boolean;
    setTransactionElement: (index: number, size: number, open: boolean) => void;
}

/**
 * A transaction element in a TransactionList.
 */
export default function TransactionElement({
    accountAddress,
    transaction,
    style,
    onClick,
    index,
    listRef,
    getOpen,
    setTransactionElement,
}: Props) {
    const memoRef = useRef<HTMLDivElement>(null);
    const open = getOpen(index);

    const { t } = useTranslation('x', { keyPrefix: 'transactionLogX' });

    const failed = transaction.status === TransactionStatus.Failed;

    const time = onlyTime(dateFromTimestamp(transaction.time, TimeStampUnit.seconds));
    const info =
        (transaction.cost !== undefined && t('withFee', { value: displayAsCcd(transaction.cost, false, true) })) ||
        (transaction.fromAddress && t('from', { value: displaySplitAddressShort(transaction.fromAddress) }));

    const addSpacing = (height: string | number | undefined) => {
        if (height !== undefined) {
            return Number(height) - SPACING;
        }
        return undefined;
    };

    useEffect(() => {
        if (!style?.height) {
            setTransactionElement(
                index,
                TRANSACTION_ELEMENT_HEIGHT + (memoRef.current?.getBoundingClientRect().height || 0) + MEMO_SPACING,
                open
            );
            listRef.current?.resetAfterIndex(0);
        }
    }, [open]);

    return (
        <Button.Base
            key={transaction.transactionHash}
            className="transaction-log__transaction"
            style={{ ...style, height: addSpacing(style?.height) }}
            onClick={onClick}
        >
            <div className={clsx('transaction value', failed && 'failed')}>
                <Text.Label className="type">{mapTypeToText(transaction.type)}</Text.Label>
                <TransactionAmount transaction={transaction} accountAddress={accountAddress} />
            </div>
            <div className="transaction info">
                <Text.Capture>{time}</Text.Capture>
                {info && <Text.Capture>{info}</Text.Capture>}
            </div>
            {transaction.memo && (
                <div className="transaction note" ref={memoRef}>
                    <Note />
                    <Text.Capture className={open ? 'expanded' : ''}>
                        {JSON.stringify(transaction.memo)}
                        <Button.Base
                            as="span"
                            className="button__icon expand"
                            onClick={(e) => {
                                e.stopPropagation();
                                setTransactionElement(index, 0, !open);
                                listRef.current?.resetAfterIndex(0);
                            }}
                        >
                            <DropDown />
                        </Button.Base>
                    </Text.Capture>
                </div>
            )}
        </Button.Base>
    );
}

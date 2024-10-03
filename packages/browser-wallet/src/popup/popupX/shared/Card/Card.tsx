import React, { ReactNode } from 'react';
import clsx from 'clsx';
import Text from '@popup/popupX/shared/Text';

type CardType = 'gradient' | 'transparent' | 'grey';

function CardRoot({
    type = 'grey',
    className,
    children,
}: {
    type?: CardType;
    className?: string;
    children: ReactNode;
}) {
    return <div className={clsx('card-x', type, className)}>{children}</div>;
}

function CardRow({ className, children }: { className?: string; children: ReactNode }) {
    return <div className={clsx('row', className)}>{children}</div>;
}

function CardRowDetails({ title, value, className }: { title?: string; value?: string; className?: string }) {
    return (
        <div className={clsx('row', 'details', className)}>
            <Text.Capture>{title}</Text.Capture>
            <Text.Capture>{value}</Text.Capture>
        </div>
    );
}

const Card = CardRoot as typeof CardRoot & {
    Row: typeof CardRow;
    RowDetails: typeof CardRowDetails;
};
Card.Row = CardRow;
Card.RowDetails = CardRowDetails;

export default Card;

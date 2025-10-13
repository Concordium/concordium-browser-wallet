import React, { ReactNode } from 'react';
import clsx from 'clsx';
import Text from '@popup/popupX/shared/Text';

type CardType = 'gradient' | 'transparent' | 'grey';

type CardRootProps = {
    type?: CardType;
    className?: string;
    children: ReactNode;
};

function CardRoot({ type = 'grey', className, children }: CardRootProps) {
    return <div className={clsx('card-x', type, className)}>{children}</div>;
}

type CardRowProps = {
    className?: string;
    children: ReactNode;
};

function CardRow({ className, children }: CardRowProps) {
    return <div className={clsx('row', className)}>{children}</div>;
}

type CardRowDetailsProps = {
    /** Title of the card row detail */
    title?: string | ReactNode;
    /** Value of the card row detail */
    value?: string | ReactNode;
    className?: string;
};

function CardRowDetails({ title, value, className }: CardRowDetailsProps) {
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

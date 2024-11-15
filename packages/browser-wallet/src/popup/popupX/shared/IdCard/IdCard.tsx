import React, { ReactNode } from 'react';
import { ClassName } from 'wallet-common-helpers';
import clsx from 'clsx';

import Card from '@popup/popupX/shared/Card';
import Text from '@popup/popupX/shared/Text';

export type IdCardBaseProps = ClassName & {
    title: ReactNode;
    subtitle: ReactNode;
    titleAction?: ReactNode;
    children?: ReactNode;
};

export default function IdCard({ title, subtitle, titleAction, children, className }: IdCardBaseProps) {
    return (
        <Card type="gradient" className={clsx('id-card-x', className)}>
            <span className="title-row">
                <Text.Main>{title}</Text.Main>
                {titleAction}
            </span>
            <Text.Capture>{subtitle}</Text.Capture>
            {children}
        </Card>
    );
}

IdCard.Content = Card;
IdCard.ContentRow = Card.Row;

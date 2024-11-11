import React, { ReactNode } from 'react';
import Card from '@popup/popupX/shared/Card';
import Text from '@popup/popupX/shared/Text';

export type IdCardBaseProps = {
    title: ReactNode;
    subtitle: ReactNode;
    titleAction?: ReactNode;
    children?: ReactNode;
};

export default function IdCard({ title, subtitle, titleAction, children }: IdCardBaseProps) {
    return (
        <Card type="gradient" className="id-card-x">
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

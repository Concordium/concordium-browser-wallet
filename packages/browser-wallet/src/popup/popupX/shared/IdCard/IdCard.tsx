import React, { ReactNode } from 'react';
import { ClassName } from 'wallet-common-helpers';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import Card from '@popup/popupX/shared/Card';
import Text from '@popup/popupX/shared/Text';
import Tooltip from '@popup/popupX/shared/Tooltip';

import WalletCoin from '@assets/svgX/UiKit/Interface/wallet-coin.svg';

export type IdCardBaseProps = ClassName & {
    title: ReactNode;
    subtitle: ReactNode;
    titleAction?: ReactNode;
    children?: ReactNode;
};

export default function IdCard({ title, subtitle, titleAction, children, className }: IdCardBaseProps) {
    const { t } = useTranslation('x', { keyPrefix: 'sharedX.idCard' });

    return (
        <Card type="gradient" className={clsx('id-card-x', className)}>
            <span className="title-row">
                <Tooltip position="top" text={t('concordiumWalletAccount')} className="id-type">
                    <WalletCoin />
                </Tooltip>
                <div className="id-title">
                    <Text.Main>{title}</Text.Main>
                    <Text.Capture>{subtitle}</Text.Capture>
                </div>
                {titleAction}
            </span>
            {children}
        </Card>
    );
}

IdCard.Content = Card;
IdCard.ContentRow = Card.Row;

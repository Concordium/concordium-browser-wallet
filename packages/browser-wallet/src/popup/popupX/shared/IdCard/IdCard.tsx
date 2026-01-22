import React, { ReactNode } from 'react';
import { ClassName } from 'wallet-common-helpers';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import Card from '@popup/popupX/shared/Card';
import Text from '@popup/popupX/shared/Text';
import Tooltip from '@popup/popupX/shared/Tooltip';

import WalletCoin from '@assets/svgX/UiKit/Interface/wallet-coin.svg';
import LedgerIcon from '@assets/svgX/ledger-icon.svg';
import { IdentityType } from '@shared/storage/types';

export type IdCardBaseProps = ClassName & {
    title: ReactNode;
    subtitle: ReactNode;
    titleAction?: ReactNode;
    children?: ReactNode;
    identityType?: IdentityType;
};

export default function IdCard({
    title,
    subtitle,
    titleAction,
    children,
    className,
    identityType = IdentityType.WalletBased,
}: IdCardBaseProps) {
    const { t } = useTranslation('x', { keyPrefix: 'sharedX.idCard' });
    const isLedgerIdentity = identityType === IdentityType.LedgerBased;
    const Icon = isLedgerIdentity ? LedgerIcon : WalletCoin;
    const tooltipText = isLedgerIdentity ? t('ledgerAccount') : t('concordiumWalletAccount');

    return (
        <Card type="gradient" className={clsx('id-card-x', className)}>
            <span className="title-row">
                <Tooltip position="top" text={tooltipText} className="id-type">
                    <Icon />
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

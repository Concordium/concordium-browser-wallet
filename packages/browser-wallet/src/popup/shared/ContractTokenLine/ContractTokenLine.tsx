import clsx from 'clsx';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ClassNameAndStyle } from 'wallet-common-helpers';
import Button from '@popup/shared/Button';
import { Checkbox } from '@popup/shared/Form/Checkbox';
import TokenBalance from '@popup/shared/TokenBalance';
import { ContractTokenDetails, getMetadataDecimals } from '@shared/utils/token-helpers';
import Img from '../Img';

export enum ChoiceStatus {
    discarded,
    chosen,
    existing,
}

type ContractTokenLineProps = ClassNameAndStyle & {
    token: ContractTokenDetails;
    onClick(token: ContractTokenDetails): void;
    onToggleChecked(token: ContractTokenDetails): void;
    status: ChoiceStatus;
};

export default function ContractTokenLine({
    token,
    onClick,
    onToggleChecked: toggleChecked,
    status,
    className,
    style,
}: ContractTokenLineProps) {
    const { t } = useTranslation('account', { keyPrefix: 'tokens.add' });

    return (
        <Button
            key={token.id}
            clear
            className={clsx('contract-token-line__token', className)}
            style={style}
            onClick={() => onClick(token)}
            disabled={!!token.error}
        >
            <div className="flex align-center h-full m-r-5">
                <Img
                    src={token.metadata.thumbnail?.url ?? token.metadata.display?.url ?? ''}
                    alt={token.metadata.name ?? ''}
                    withDefaults
                />
                <div>
                    <div className="clamp-2">{token.metadata?.name}</div>
                    <div
                        className={clsx(
                            'contract-token-line__token-balance',
                            token.balance !== 0n && 'contract-token-line__token-balance--owns'
                        )}
                    >
                        {t('ItemBalancePre')}
                        <TokenBalance
                            balance={token.balance}
                            decimals={getMetadataDecimals({ decimals: token.metadata?.decimals })}
                            symbol={token.metadata?.symbol}
                        />
                    </div>
                    <div className="contract-token-line__error">{token.error}</div>
                </div>
            </div>
            {!token.error && (
                <Checkbox
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    onChange={() => toggleChecked(token)}
                    checked={status === ChoiceStatus.chosen || status === ChoiceStatus.existing}
                    className="contract-token-line__checkbox"
                    disabled={status === ChoiceStatus.existing}
                />
            )}
        </Button>
    );
}

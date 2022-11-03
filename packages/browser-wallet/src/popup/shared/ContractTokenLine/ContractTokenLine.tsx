import clsx from 'clsx';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ClassNameAndStyle } from 'wallet-common-helpers';
import Button from '@popup/shared/Button';
import { Checkbox } from '@popup/shared/Form/Checkbox';
import TokenBalance from '@popup/shared/TokenBalance';
import { ContractTokenDetails } from '@shared/utils/token-helpers';

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
        >
            <div className="flex align-center h-full m-r-5">
                <img src={token.metadata.thumbnail?.url} alt={token.metadata.name ?? ''} />
                <div>
                    {token.metadata.name}
                    <div
                        className={clsx(
                            'contract-token-line__token-balance',
                            token.balance !== 0n && 'contract-token-line__token-balance--owns'
                        )}
                    >
                        {t('ItemBalancePre')}
                        <TokenBalance
                            balance={token.balance}
                            decimals={token.metadata.decimals ?? 0}
                            symbol={token.metadata.symbol}
                        />
                    </div>
                </div>
            </div>
            <Checkbox
                onClick={(e) => {
                    e.stopPropagation();
                }}
                onChange={() => toggleChecked(token)}
                checked={status === ChoiceStatus.chosen || status === ChoiceStatus.existing}
                className="contract-token-line__checkbox"
                disabled={status === ChoiceStatus.existing}
            />
        </Button>
    );
}

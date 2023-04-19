import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    AccountTransactionPayload,
    AccountTransactionType,
    isBakerAccount,
    isDelegatorAccount,
    ConfigureBakerPayload,
    ConfigureDelegationPayload,
} from '@concordium/web-sdk';
import { useSelectedAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';

interface Props {
    payload: AccountTransactionPayload;
    transactionType: AccountTransactionType;
}

export function TransactionMessage({ transactionType, payload }: Props) {
    const { t } = useTranslation('account', { keyPrefix: 'transactionMessage' });
    const accountInfo = useSelectedAccountInfo();

    const message = useMemo(() => {
        if (!accountInfo) {
            return undefined;
        }

        switch (transactionType) {
            case AccountTransactionType.ConfigureBaker: {
                if (isBakerAccount(accountInfo)) {
                    const newStake = (payload as ConfigureBakerPayload).stake?.microCcdAmount;
                    if (newStake === undefined) {
                        return undefined;
                    }
                    if (accountInfo.accountBaker.stakedAmount > newStake) {
                        return t('configureBaker.lowerBakerStake');
                    }
                    if (newStake === 0n) {
                        return t('configureBaker.removeBaker');
                    }
                } else {
                    return t('configureBaker.registerBaker');
                }
                break;
            }
            case AccountTransactionType.ConfigureDelegation: {
                if (isDelegatorAccount(accountInfo)) {
                    const newStake = (payload as ConfigureDelegationPayload).stake?.microCcdAmount;
                    if (newStake === undefined) {
                        return undefined;
                    }
                    if (accountInfo.accountDelegation.stakedAmount > newStake) {
                        return t('configureDelegation.lowerDelegationStake');
                    }
                    if (newStake === 0n) {
                        return t('configureDelegation.remove');
                    }
                } else {
                    return t('configureDelegation.register');
                }
                break;
            }
            default:
                break;
        }
        return undefined;
    }, []);

    if (!message) {
        return null;
    }

    return <p className="white-space-break text-center m-h-20 m-t-20 m-b-0">{message}</p>;
}

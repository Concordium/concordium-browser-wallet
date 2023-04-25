import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    AccountTransactionPayload,
    AccountTransactionType,
    isBakerAccount,
    isDelegatorAccount,
    ConfigureBakerPayload,
    ConfigureDelegationPayload,
    isChainParametersV1,
} from '@concordium/web-sdk';
import { useSelectedAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import { useBlockChainParameters } from '@popup/shared/BlockChainParametersProvider';
import { secondsToDaysRoundedDown } from '@shared/utils/time-helpers';
import { filterType } from '../Earn/utils';

interface Props {
    payload: AccountTransactionPayload;
    transactionType: AccountTransactionType;
}

export function TransactionMessage({ transactionType, payload }: Props) {
    const { t } = useTranslation('account', { keyPrefix: 'transactionMessage' });
    const accountInfo = useSelectedAccountInfo();
    const chainParameters = useBlockChainParameters();
    const parametersV1 = chainParameters ? filterType(isChainParametersV1)(chainParameters) : undefined;

    const message = useMemo(() => {
        if (!accountInfo) {
            return undefined;
        }

        switch (transactionType) {
            case AccountTransactionType.ConfigureBaker: {
                const cooldownPeriod = secondsToDaysRoundedDown(parametersV1?.poolOwnerCooldown);
                if (isBakerAccount(accountInfo)) {
                    const newStake = (payload as ConfigureBakerPayload).stake?.microCcdAmount;
                    if (newStake === undefined) {
                        return undefined;
                    }
                    if (newStake === 0n) {
                        return t('configureBaker.removeBaker', { cooldownPeriod });
                    }
                    if (accountInfo.accountBaker.stakedAmount > newStake) {
                        return t('configureBaker.lowerBakerStake', { cooldownPeriod });
                    }
                } else {
                    return t('configureBaker.registerBaker', { cooldownPeriod });
                }
                break;
            }
            case AccountTransactionType.ConfigureDelegation: {
                const cooldownPeriod = secondsToDaysRoundedDown(parametersV1?.delegatorCooldown);
                if (isDelegatorAccount(accountInfo)) {
                    const newStake = (payload as ConfigureDelegationPayload).stake?.microCcdAmount;
                    if (newStake === undefined) {
                        return undefined;
                    }
                    if (newStake === 0n) {
                        return t('configureDelegation.remove', {
                            cooldownPeriod,
                        });
                    }
                    if (accountInfo.accountDelegation.stakedAmount > newStake) {
                        return t('configureDelegation.lowerDelegationStake', {
                            cooldownPeriod,
                        });
                    }
                } else {
                    return t('configureDelegation.register', {
                        cooldownPeriod,
                    });
                }
                break;
            }
            default:
                break;
        }
        return undefined;
    }, [parametersV1?.delegatorCooldown]);

    if (!message) {
        return null;
    }

    return <p className="white-space-break text-center m-h-20 m-t-20 m-b-0">{message}</p>;
}

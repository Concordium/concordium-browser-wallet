import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    AccountTransactionPayload,
    AccountTransactionType,
    ConfigureBakerPayload,
    ConfigureDelegationPayload,
    AccountInfoType,
} from '@concordium/web-sdk';
import { useSelectedAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import { useBlockChainParametersAboveV0 } from '@popup/shared/BlockChainParametersProvider';
import { secondsToDaysRoundedDown } from '@shared/utils/time-helpers';

interface Props {
    payload: AccountTransactionPayload;
    transactionType: AccountTransactionType;
}

/**
 * Component that displays a message related to a transaction before sending it.
 * Note that only some transactions warrant a message.
 */
export function TransactionMessage({ transactionType, payload }: Props) {
    const { t } = useTranslation('account', { keyPrefix: 'transactionMessage' });
    const accountInfo = useSelectedAccountInfo();
    const parametersV1 = useBlockChainParametersAboveV0();

    const message = useMemo(() => {
        if (!accountInfo) {
            return undefined;
        }

        let cooldownParam = 0n;
        if (parametersV1 !== undefined) {
            // From protocol version 7, the lower of the two values is the value that counts.
            cooldownParam =
                parametersV1.poolOwnerCooldown < parametersV1.delegatorCooldown
                    ? parametersV1.poolOwnerCooldown
                    : parametersV1.delegatorCooldown;
        }
        const cooldownPeriod = secondsToDaysRoundedDown(cooldownParam);

        switch (transactionType) {
            case AccountTransactionType.ConfigureBaker: {
                if (accountInfo.type === AccountInfoType.Baker) {
                    const newStake = (payload as ConfigureBakerPayload).stake?.microCcdAmount;
                    if (newStake === 0n) {
                        return t('configureBaker.removeBaker', { cooldownPeriod });
                    }
                    if (newStake && accountInfo.accountBaker.stakedAmount.microCcdAmount > newStake) {
                        return t('configureBaker.lowerBakerStake', { cooldownPeriod });
                    }
                    return undefined;
                }
                return t('configureBaker.registerBaker', { cooldownPeriod });
            }
            case AccountTransactionType.ConfigureDelegation: {
                if (accountInfo.type === AccountInfoType.Delegator) {
                    const newStake = (payload as ConfigureDelegationPayload).stake?.microCcdAmount;
                    if (newStake === 0n) {
                        return t('configureDelegation.remove', {
                            cooldownPeriod,
                        });
                    }
                    if (newStake && accountInfo.accountDelegation.stakedAmount.microCcdAmount > newStake) {
                        return t('configureDelegation.lowerDelegationStake', {
                            cooldownPeriod,
                        });
                    }
                    return undefined;
                }
                return t('configureDelegation.register', {
                    cooldownPeriod,
                });
            }
            default:
                break;
        }
        return undefined;
    }, [parametersV1?.delegatorCooldown]);
    return message ? <p className="white-space-break text-center m-h-20 m-t-20 m-b-0">{message}</p> : null;
}

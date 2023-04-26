import React, { useMemo, useState } from 'react';
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
import { useBlockChainParametersV1 } from '@popup/shared/BlockChainParametersProvider';
import { secondsToDaysRoundedDown } from '@shared/utils/time-helpers';

interface Props {
    payload: AccountTransactionPayload;
    transactionType: AccountTransactionType;
    setShowNotice: (show: boolean) => void;
    showNotice: boolean;
}

export function TransactionMessage({ transactionType, payload, showNotice, setShowNotice }: Props) {
    const { t } = useTranslation('account', { keyPrefix: 'transactionMessage' });
    const { t: tShared } = useTranslation('shared');
    const accountInfo = useSelectedAccountInfo();
    const parametersV1 = useBlockChainParametersV1();
    const [noticeMessage, setNoticeMessage] = useState<string>();

    const message = useMemo(() => {
        if (!accountInfo) {
            return undefined;
        }

        switch (transactionType) {
            case AccountTransactionType.ConfigureBaker: {
                const cooldownPeriod = secondsToDaysRoundedDown(parametersV1?.poolOwnerCooldown);
                if (isBakerAccount(accountInfo)) {
                    const newStake = (payload as ConfigureBakerPayload).stake?.microCcdAmount;
                    if (newStake === 0n) {
                        return t('configureBaker.removeBaker', { cooldownPeriod });
                    }
                    if (newStake && accountInfo.accountBaker.stakedAmount > newStake) {
                        return t('configureBaker.lowerBakerStake', { cooldownPeriod });
                    }
                    if ((payload as ConfigureBakerPayload).keys) {
                        setNoticeMessage(t('configureBaker.notice.updateKeys'));
                    } else {
                        setNoticeMessage(t('configureBaker.notice.update'));
                    }
                    return undefined;
                }
                setNoticeMessage(t('configureBaker.notice.start'));
                return t('configureBaker.registerBaker', { cooldownPeriod });
            }
            case AccountTransactionType.ConfigureDelegation: {
                const cooldownPeriod = secondsToDaysRoundedDown(parametersV1?.delegatorCooldown);
                if (isDelegatorAccount(accountInfo)) {
                    const newStake = (payload as ConfigureDelegationPayload).stake?.microCcdAmount;
                    if (newStake === 0n) {
                        return t('configureDelegation.remove', {
                            cooldownPeriod,
                        });
                    }
                    if (newStake && accountInfo.accountDelegation.stakedAmount > newStake) {
                        return t('configureDelegation.lowerDelegationStake', {
                            cooldownPeriod,
                        });
                    }
                    setNoticeMessage(t('configureDelegation.notice.update'));
                    return undefined;
                }
                setNoticeMessage(t('configureDelegation.notice.start'));
                return t('configureDelegation.register', {
                    cooldownPeriod,
                });
            }
            default:
                break;
        }
        return undefined;
    }, [parametersV1?.delegatorCooldown]);

    return (
        <>
            <Modal open={Boolean(noticeMessage) && showNotice} disableClose>
                <div>
                    <h3 className="m-t-0">{tShared('notice')}</h3>
                    <p className="white-space-break ">{noticeMessage}</p>
                    <Button className="m-t-10" width="wide" onClick={() => setShowNotice(false)}>
                        {tShared('okay')}
                    </Button>
                </div>
            </Modal>
            {message && <p className="white-space-break text-center m-h-20 m-t-20 m-b-0">{message}</p>}
        </>
    );
}

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
import { useBlockChainParametersAboveV0 } from '@popup/shared/BlockChainParametersProvider';
import Modal from '@popup/shared/Modal';
import Button from '@popup/shared/Button';

interface Props {
    payload: AccountTransactionPayload;
    transactionType: AccountTransactionType;
    setShowPopup: (show: boolean) => void;
    showPopup: boolean;
}

/**
 * Component that displays a popup with a message related to a transaction when sending it.
 * Note that only some transactions warrant a popup/message.
 */
export default function TransactionPopup({ transactionType, payload, showPopup, setShowPopup }: Props) {
    const { t } = useTranslation('account', { keyPrefix: 'transactionPopup' });
    const { t: tShared } = useTranslation('shared');
    const accountInfo = useSelectedAccountInfo();
    const parametersV1 = useBlockChainParametersAboveV0();

    const message = useMemo(() => {
        if (accountInfo) {
            switch (transactionType) {
                case AccountTransactionType.ConfigureBaker: {
                    if (isBakerAccount(accountInfo)) {
                        const newStake = (payload as ConfigureBakerPayload).stake?.microCcdAmount;
                        if (newStake === undefined || accountInfo.accountBaker.stakedAmount < newStake) {
                            if ((payload as ConfigureBakerPayload).keys) {
                                return t('configureBaker.updateKeys');
                            }
                            return t('configureBaker.update');
                        }
                    } else {
                        return t('configureBaker.start');
                    }
                    break;
                }
                case AccountTransactionType.ConfigureDelegation: {
                    if (isDelegatorAccount(accountInfo)) {
                        const newStake = (payload as ConfigureDelegationPayload).stake?.microCcdAmount;
                        if (newStake === undefined || accountInfo.accountDelegation.stakedAmount < newStake) {
                            return t('configureDelegation.update');
                        }
                    } else {
                        return t('configureDelegation.start');
                    }
                    break;
                }
                default:
                    break;
            }
        }
        return undefined;
    }, [parametersV1?.delegatorCooldown]);

    return (
        <Modal open={Boolean(message) && showPopup} disableClose>
            <div>
                <h3 className="m-t-0">{tShared('notice')}</h3>
                <p className="white-space-break ">{message}</p>
                <Button className="m-t-10" width="wide" onClick={() => setShowPopup(false)}>
                    {tShared('okay')}
                </Button>
            </div>
        </Modal>
    );
}

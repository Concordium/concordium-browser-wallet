import { useAtomValue } from 'jotai';
import { grpcClientAtom } from '@popup/store/settings';
import { AccountInfo, AccountInfoType, DelegationTargetType } from '@concordium/web-sdk';
import { useEffect, useState } from 'react';

export enum SuspendedStatus {
    notSuspended,
    isPrimedForSuspension,
    suspended,
}

function getBakerId(accountInfo: AccountInfo) {
    switch (accountInfo.type) {
        case AccountInfoType.Baker:
            return accountInfo.accountBaker.bakerId;
        case AccountInfoType.Delegator: {
            if (accountInfo.accountDelegation.delegationTarget.delegateType === DelegationTargetType.Baker) {
                return accountInfo.accountDelegation.delegationTarget.bakerId;
            }
            return undefined;
        }
        default:
            return undefined;
    }
}

export function useSuspendedStatus(accountInfo?: AccountInfo): SuspendedStatus {
    const [suspendedStatus, setSuspendedStatus] = useState<SuspendedStatus>(SuspendedStatus.notSuspended);
    const client = useAtomValue(grpcClientAtom);

    useEffect(() => {
        setSuspendedStatus(SuspendedStatus.notSuspended);
        if (!accountInfo) return;

        const bakerId = getBakerId(accountInfo);

        if (typeof bakerId === 'bigint') {
            client.getPoolInfo(bakerId).then((pool) => {
                if (pool.currentPaydayStatus?.isPrimedForSuspension) {
                    setSuspendedStatus(SuspendedStatus.isPrimedForSuspension);
                }

                if (pool.isSuspended) {
                    setSuspendedStatus(SuspendedStatus.suspended);
                }
            });
        }
    }, [accountInfo?.accountAddress?.address, accountInfo?.type, accountInfo?.accountAmount]);

    return suspendedStatus;
}

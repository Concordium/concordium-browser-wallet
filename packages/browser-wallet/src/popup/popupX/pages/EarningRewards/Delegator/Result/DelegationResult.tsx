import React, { useMemo } from 'react';
import {
    AccountInfoDelegator,
    AccountTransactionType,
    ConfigureDelegationPayload,
    DelegationTargetType,
    TransactionHash,
} from '@concordium/web-sdk';
import { Navigate, useLocation, Location, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Button from '@popup/popupX/shared/Button';
import Page from '@popup/popupX/shared/Page';
import { formatCcdAmount } from '@popup/popupX/shared/utils/helpers';
import Card from '@popup/popupX/shared/Card';
import { ensureDefined } from '@shared/utils/basic-helpers';
import { useBlockChainParametersAboveV0 } from '@popup/shared/BlockChainParametersProvider';
import { secondsToDaysRoundedDown } from '@shared/utils/time-helpers';
import { useGetTransactionFee, useTransactionSubmit } from '@popup/shared/utils/transaction-helpers';
import { cpStakingCooldown } from '@shared/utils/chain-parameters-helpers';
import { submittedTransactionRoute } from '@popup/popupX/constants/routes';
import Text from '@popup/popupX/shared/Text';
import { useSelectedAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';

export type DelegationResultLocationState = {
    payload: ConfigureDelegationPayload;
    type: 'register' | 'change' | 'remove';
};

export default function DelegationResult() {
    const { state } = useLocation() as Location & {
        state: DelegationResultLocationState | undefined;
    };
    const nav = useNavigate();
    const { t } = useTranslation('x', { keyPrefix: 'earn.delegator' });
    const getCost = useGetTransactionFee();
    const accountInfo = ensureDefined(useSelectedAccountInfo(), 'No account selected');

    const parametersV1 = useBlockChainParametersAboveV0();
    const submitTransaction = useTransactionSubmit(
        accountInfo.accountAddress,
        AccountTransactionType.ConfigureDelegation
    );

    const cooldown = useMemo(() => {
        let cooldownParam = 0n;
        if (parametersV1 !== undefined) {
            cooldownParam = cpStakingCooldown(parametersV1);
        }
        return secondsToDaysRoundedDown(cooldownParam);
    }, [parametersV1]);

    const [title, notice] = useMemo(() => {
        switch (state?.type) {
            case 'register':
                return [t('register.title'), t('register.notice', { cooldown })];
            case 'change':
                if (
                    state.payload.stake === undefined ||
                    state.payload.stake.microCcdAmount >=
                        (accountInfo as AccountInfoDelegator).accountDelegation.stakedAmount.microCcdAmount
                ) {
                    // Staked amount is not lowered
                    return [t('update.title')];
                }
                return [t('update.title'), t('update.lowerStakeNotice', { cooldown })];
            case 'remove':
                return [t('remove.title'), t('remove.notice', { cooldown })];
            default:
                throw new Error("'type' must be defined on route state");
        }
    }, [state, t, cooldown]);

    if (state === undefined) {
        return <Navigate to=".." />;
    }

    const fee = getCost(AccountTransactionType.ConfigureDelegation, state.payload);
    const submit = async () => {
        if (fee === undefined) {
            throw Error('Fee could not be calculated');
        }
        const tx = await submitTransaction(state.payload, fee);
        nav(submittedTransactionRoute(TransactionHash.fromHexString(tx)));
    };

    return (
        <Page className="delegation-result-container">
            <Page.Top heading={title} />
            {notice !== undefined && <Text.Capture>{notice}</Text.Capture>}
            <Card className="delegation-result__card">
                <Card.Row>
                    <Card.RowDetails title={t('submit.sender.label')} value={accountInfo.accountAddress.address} />
                </Card.Row>
                {state.payload.delegationTarget !== undefined && (
                    <Card.Row>
                        <Card.RowDetails
                            title={t('values.target.label')}
                            value={
                                state.payload.delegationTarget.delegateType === DelegationTargetType.Baker
                                    ? t('values.target.validator', {
                                          id: state.payload.delegationTarget.bakerId.toString(),
                                      })
                                    : t('values.target.passive')
                            }
                        />
                    </Card.Row>
                )}
                {state.payload.stake !== undefined && (
                    <Card.Row>
                        <Card.RowDetails
                            title={t('values.amount.label')}
                            value={`${formatCcdAmount(state.payload.stake)} CCD`}
                        />
                    </Card.Row>
                )}
                {state.payload.restakeEarnings !== undefined && (
                    <Card.Row>
                        <Card.RowDetails
                            title={t('values.redelegate.label')}
                            value={
                                state.payload.restakeEarnings
                                    ? t('values.redelegate.delegation')
                                    : t('values.redelegate.public')
                            }
                        />
                    </Card.Row>
                )}
                <Card.Row>
                    <Card.RowDetails
                        title={t('submit.fee.label')}
                        value={`${fee !== undefined ? formatCcdAmount(fee) : '...'} CCD`}
                    />
                </Card.Row>
            </Card>
            <Page.Footer>
                <Button.Main onClick={submit} label={t('submit.button')} className="m-t-20" />
            </Page.Footer>
        </Page>
    );
}

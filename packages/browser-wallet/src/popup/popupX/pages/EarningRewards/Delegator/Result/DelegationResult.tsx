import React, { useMemo } from 'react';
import { ConfigureDelegationPayload, DelegationTargetType } from '@concordium/web-sdk';
import { Navigate, useLocation, Location } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';

import { selectedAccountAtom } from '@popup/store/account';
import Button from '@popup/popupX/shared/Button';
import Page from '@popup/popupX/shared/Page';
import { formatCcdAmount } from '@popup/popupX/shared/utils/helpers';
import Card from '@popup/popupX/shared/Card';
import { ensureDefined } from '@shared/utils/basic-helpers';
import { useBlockChainParametersAboveV0 } from '@popup/shared/BlockChainParametersProvider';
import { secondsToDaysRoundedDown } from '@shared/utils/time-helpers';

import { useGetConfigureDelegationCost } from '../util';

export type DelegationResultLocationState = {
    payload: ConfigureDelegationPayload;
    type: 'register' | 'change' | 'remove';
};

export default function DelegationResult() {
    const { state } = useLocation() as Location & {
        state: DelegationResultLocationState | undefined;
    };
    const { t } = useTranslation('x', { keyPrefix: 'earn.delegator' });
    const getCost = useGetConfigureDelegationCost();
    const account = ensureDefined(useAtomValue(selectedAccountAtom), 'No account selected');

    const parametersV1 = useBlockChainParametersAboveV0();

    const cooldown = useMemo(() => {
        let cooldownParam = 0n;
        if (parametersV1 !== undefined) {
            // From protocol version 7, the lower of the two values is the value that counts.
            cooldownParam =
                parametersV1.poolOwnerCooldown < parametersV1.delegatorCooldown
                    ? parametersV1.poolOwnerCooldown
                    : parametersV1.delegatorCooldown;
        }
        return secondsToDaysRoundedDown(cooldownParam);
    }, [parametersV1]);

    const title = useMemo(() => {
        switch (state?.type) {
            case 'register':
                return t('register.title');
            case 'change':
                return t('update.title');
            // case 'remove':
            //    return t('remove.title');
            default:
                return undefined;
        }
    }, [state, t]);
    const notice = t('register.notice', { cooldown }); // TODO: add more cases when supporting change/remove

    if (state === undefined) {
        return <Navigate to=".." />;
    }

    const fee = getCost(state.payload);

    const submit = () => {
        console.log(state.payload);
    };

    return (
        <Page className="delegation-result-container">
            <Page.Top heading={title} />
            <span className="capture__main_small">{notice}</span>
            <Card className="delegation-result__card">
                <Card.Row>
                    <Card.RowDetails title={t('submit.sender.label')} value={account} />
                </Card.Row>
                {state.payload.delegationTarget !== undefined && (
                    <Card.Row>
                        <Card.RowDetails
                            title={t('submit.target.label')}
                            value={
                                state.payload.delegationTarget.delegateType === DelegationTargetType.Baker
                                    ? t('submit.target.validator', {
                                          id: state.payload.delegationTarget.bakerId.toString(),
                                      })
                                    : t('submit.target.passive')
                            }
                        />
                    </Card.Row>
                )}
                {state.payload.stake !== undefined && (
                    <Card.Row>
                        <Card.RowDetails
                            title={t('submit.amount.label')}
                            value={`${formatCcdAmount(state.payload.stake)} CCD`}
                        />
                    </Card.Row>
                )}
                {state.payload.restakeEarnings !== undefined && (
                    <Card.Row>
                        <Card.RowDetails
                            title={t('submit.redelegate.label')}
                            value={
                                state.payload.restakeEarnings
                                    ? t('submit.redelegate.delegation')
                                    : t('submit.redelegate.public')
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

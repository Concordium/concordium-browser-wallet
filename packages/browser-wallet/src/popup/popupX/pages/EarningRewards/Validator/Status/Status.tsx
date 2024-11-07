import React from 'react';
import { AccountInfoType, CcdAmount } from '@concordium/web-sdk';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';

import { absoluteRoutes } from '@popup/popupX/constants/routes';
import Button from '@popup/popupX/shared/Button';
import Card from '@popup/popupX/shared/Card';
import Page from '@popup/popupX/shared/Page';
import { useSelectedAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import { useBlockChainParametersAboveV0 } from '@popup/shared/BlockChainParametersProvider';

import AccountCooldowns from '../../AccountCooldowns';
import { showValidatorRestake, showValidatorAmount, showValidatorOpenStatus, isRange } from '../util';
import { ValidationResultLocationState } from '../Result';

const REMOVE_STATE: ValidationResultLocationState = {
    type: 'remove',
    payload: { stake: CcdAmount.zero() },
};

export default function ValidatorStatus() {
    const { t } = useTranslation('x', { keyPrefix: 'earn.validator' });
    const accountInfo = useSelectedAccountInfo();
    const nav = useNavigate();
    const chainParams = useBlockChainParametersAboveV0();

    if (accountInfo?.type !== AccountInfoType.Baker) {
        return <Navigate to=".." />;
    }

    const { accountBaker, accountCooldowns } = accountInfo;

    if (accountBaker.version === 0 || chainParams === undefined) {
        // assume protocol version >= 4
        return null;
    }

    return (
        <Page className="validator-status">
            <Page.Top heading={t('status.title')} />
            <Card>
                <Card.Row>
                    <Card.RowDetails
                        title={t('values.amount.label')}
                        value={showValidatorAmount(accountBaker.stakedAmount)}
                    />
                </Card.Row>
                <Card.Row>
                    <Card.RowDetails
                        title={t('values.restake.label')}
                        value={showValidatorRestake(accountBaker.restakeEarnings)}
                    />
                </Card.Row>
            </Card>
            <AccountCooldowns cooldowns={accountCooldowns} />
            <Card className="validator-status__info">
                <Card.Row>
                    <Card.RowDetails title={t('values.id.label')} value={accountBaker.bakerId.toString()} />
                </Card.Row>
                <Card.Row>
                    <Card.RowDetails
                        title={t('values.openStatus.label')}
                        value={showValidatorOpenStatus(accountBaker.bakerPoolInfo.openStatus)}
                    />
                </Card.Row>
                <Card.Row>
                    <Card.RowDetails
                        title={t('values.metadataUrl.label')}
                        value={accountBaker.bakerPoolInfo.metadataUrl || ' '}
                    />
                </Card.Row>
                {isRange(chainParams.transactionCommissionRange) && (
                    <Card.Row>
                        <Card.RowDetails
                            title={t('values.transactionFeeCommission.label')}
                            value={`${accountBaker.bakerPoolInfo.commissionRates.transactionCommission * 100}%`}
                        />
                    </Card.Row>
                )}
                {isRange(chainParams.bakingCommissionRange) && (
                    <Card.Row>
                        <Card.RowDetails
                            title={t('values.bakingRewardCommission.label')}
                            value={`${accountBaker.bakerPoolInfo.commissionRates.bakingCommission * 100}%`}
                        />
                    </Card.Row>
                )}
                {isRange(chainParams.finalizationCommissionRange) && (
                    <Card.Row>
                        <Card.RowDetails
                            title={t('values.finalizationRewardCommission.label')}
                            value={`${accountBaker.bakerPoolInfo.commissionRates.finalizationCommission * 100}%`}
                        />
                    </Card.Row>
                )}
            </Card>
            <Page.Footer>
                <Button.Main
                    className="m-t-10"
                    label={t('status.buttonUpdate')}
                    onClick={() => nav(absoluteRoutes.settings.earn.validator.update.path)}
                />
                <Button.Main
                    label={t('status.buttonStop')}
                    onClick={() => nav(absoluteRoutes.settings.earn.validator.submit.path, { state: REMOVE_STATE })}
                />
            </Page.Footer>
        </Page>
    );
}

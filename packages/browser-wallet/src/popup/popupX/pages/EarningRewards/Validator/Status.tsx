import React from 'react';
import { AccountInfoType, CcdAmount } from '@concordium/web-sdk';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import Button from '@popup/popupX/shared/Button';
import Card from '@popup/popupX/shared/Card';
import Page from '@popup/popupX/shared/Page';
import { useTranslation } from 'react-i18next';
import { useSelectedAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import { Navigate, useNavigate } from 'react-router-dom';
import AccountCooldowns from '../AccountCooldowns';
import { showValidatorRestake, showValidatorAmount, showValidatorOpenStatus } from './util';
import { ValidationResultLocationState } from './Result/ValidatorResult';

const REMOVE_STATE: ValidationResultLocationState = {
    type: 'remove',
    payload: { stake: CcdAmount.zero() },
};

export default function ValidatorStatus() {
    const { t } = useTranslation('x', { keyPrefix: 'earn.validator' });
    const accountInfo = useSelectedAccountInfo();
    const nav = useNavigate();

    if (accountInfo?.type !== AccountInfoType.Baker) {
        return <Navigate to=".." />;
    }

    const { accountBaker, accountCooldowns } = accountInfo;

    if (accountBaker.version === 0) {
        // assume protocol version >= 4
        return null;
    }

    return (
        <Page>
            <Page.Top heading={t('status.title')} />
            <Card>
                <Card.Row>
                    <Card.RowDetails
                        title={t('values.amount.label')}
                        value={showValidatorAmount(accountBaker.stakedAmount)}
                    />
                </Card.Row>
                <Card.Row>
                    <Card.RowDetails title={t('values.id.label')} value={accountBaker.bakerId.toString()} />
                </Card.Row>
                <Card.Row>
                    <Card.RowDetails
                        title={t('values.restake.label')}
                        value={showValidatorRestake(accountBaker.restakeEarnings)}
                    />
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
                        value={accountBaker.bakerPoolInfo.metadataUrl}
                    />
                </Card.Row>
            </Card>
            <AccountCooldowns cooldowns={accountCooldowns} />
            <Page.Footer>
                <Button.Main
                    className="m-t-10"
                    label={t('status.buttonUpdate')}
                    onClick={() => nav(absoluteRoutes.settings.earn.delegator.update.path)}
                />
                <Button.Main
                    label={t('status.buttonStop')}
                    onClick={() => nav(absoluteRoutes.settings.earn.validator.submit.path, { state: REMOVE_STATE })}
                />
            </Page.Footer>
        </Page>
    );
}

import React from 'react';
import { AccountInfoType, DelegationTargetType } from '@concordium/web-sdk';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import Button from '@popup/popupX/shared/Button';
import Card from '@popup/popupX/shared/Card';
import Page from '@popup/popupX/shared/Page';
import { useTranslation } from 'react-i18next';
import { formatCcdAmount } from '@popup/popupX/shared/utils/helpers';
import { useSelectedAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import { Navigate, useNavigate } from 'react-router-dom';
import AccountCooldowns from '../AccountCooldowns';

export default function DelegatorStatus() {
    const { t } = useTranslation('x', { keyPrefix: 'earn.delegator' });
    const accountInfo = useSelectedAccountInfo();
    const nav = useNavigate();

    if (accountInfo?.type !== AccountInfoType.Delegator) {
        return <Navigate to=".." />;
    }

    const { accountDelegation, accountCooldowns } = accountInfo;

    return (
        <Page>
            <Page.Top heading={t('status.title')} />
            <Card>
                <Card.Row>
                    <Card.RowDetails
                        title={t('values.amount.label')}
                        value={`${formatCcdAmount(accountDelegation.stakedAmount)}`}
                    />
                </Card.Row>
                <Card.Row>
                    <Card.RowDetails
                        title={t('values.target.label')}
                        value={
                            accountDelegation.delegationTarget.delegateType === DelegationTargetType.Baker
                                ? t('values.target.validator', {
                                      id: accountDelegation.delegationTarget.bakerId.toString(),
                                  })
                                : t('values.target.passive')
                        }
                    />
                </Card.Row>
                <Card.Row>
                    <Card.RowDetails
                        title={t('values.redelegate.label')}
                        value={
                            accountDelegation.restakeEarnings
                                ? t('values.redelegate.delegation')
                                : t('values.redelegate.public')
                        }
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
                    onClick={() => nav(absoluteRoutes.settings.earn.delegator.stop.path)}
                />
            </Page.Footer>
        </Page>
    );
}

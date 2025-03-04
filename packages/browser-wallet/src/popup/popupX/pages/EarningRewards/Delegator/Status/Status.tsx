import React from 'react';
import { AccountInfo, AccountInfoType, CcdAmount, DelegationTargetType } from '@concordium/web-sdk';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import Button from '@popup/popupX/shared/Button';
import Card from '@popup/popupX/shared/Card';
import Page from '@popup/popupX/shared/Page';
import { useTranslation } from 'react-i18next';
import { formatCcdAmount } from '@popup/popupX/shared/utils/helpers';
import { useSelectedAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { SuspendedStatus, useSuspendedStatus } from '@popup/popupX/shared/utils/pool-status-helpers';
import Text from '@popup/popupX/shared/Text';
import Stop from '@assets/svgX/stop-square.svg';
import Arrows from '@assets/svgX/arrows-clockwise.svg';
import AccountCooldowns from '../../AccountCooldowns';
import { DelegationResultLocationState } from '../Result/DelegationResult';

const REMOVE_STATE: DelegationResultLocationState = {
    type: 'remove',
    payload: { stake: CcdAmount.zero() },
};

function SuspendedStatusInfo({ accountInfo }: { accountInfo: AccountInfo }) {
    const { t } = useTranslation('x', { keyPrefix: 'earn.delegator.status' });
    const suspendedStatus = useSuspendedStatus(accountInfo);
    if (suspendedStatus === SuspendedStatus.suspended) {
        return (
            <Card className="suspend-status-info">
                <Text.Main>{t('validatorSuspended')}</Text.Main>
                <Text.Capture>{t('validatorSuspendedInfo')}</Text.Capture>
            </Card>
        );
    }
    return null;
}

export default function DelegatorStatus() {
    const { t } = useTranslation('x', { keyPrefix: 'earn.delegator' });
    const accountInfo = useSelectedAccountInfo();
    const nav = useNavigate();

    if (accountInfo?.type !== AccountInfoType.Delegator) {
        return <Navigate to={absoluteRoutes.settings.earn.path} />;
    }

    const { accountDelegation, accountCooldowns } = accountInfo;

    return (
        <Page className="delegator-status">
            <Page.Top heading={t('status.title')} />
            <SuspendedStatusInfo accountInfo={accountInfo} />
            <div className="delegator-status__action-buttons">
                <Button.IconTile
                    icon={<Stop />}
                    label={t('status.buttonStop')}
                    onClick={() => nav(absoluteRoutes.settings.earn.delegator.submit.path, { state: REMOVE_STATE })}
                />
                <Button.IconTile
                    icon={<Arrows />}
                    label={t('status.buttonUpdate')}
                    onClick={() => nav(absoluteRoutes.settings.earn.delegator.update.path)}
                />
            </div>
            <AccountCooldowns cooldowns={accountCooldowns} />
            <Card>
                <Card.Row>
                    <Card.RowDetails
                        title={t('values.amount.label')}
                        value={`${formatCcdAmount(accountDelegation.stakedAmount)} CCD`}
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
                {accountDelegation.delegationTarget.delegateType === DelegationTargetType.Baker && (
                    <Card.Row>
                        <Card.RowDetails
                            title={t('values.validatorId.label')}
                            value={accountDelegation.delegationTarget.bakerId.toString()}
                        />
                    </Card.Row>
                )}
            </Card>
        </Page>
    );
}

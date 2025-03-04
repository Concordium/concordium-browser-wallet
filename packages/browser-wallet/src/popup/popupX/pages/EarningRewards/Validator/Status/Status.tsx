import React from 'react';
import { AccountInfoType, CcdAmount } from '@concordium/web-sdk';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';

import { absoluteRoutes } from '@popup/popupX/constants/routes';
import Button from '@popup/popupX/shared/Button';
import Card from '@popup/popupX/shared/Card';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import { useSelectedAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import { useBlockChainParametersAboveV0 } from '@popup/shared/BlockChainParametersProvider';

import Stop from '@assets/svgX/stop-square.svg';
import Arrows from '@assets/svgX/arrows-clockwise.svg';
import Pause from '@assets/svgX/pause.svg';
import Play from '@assets/svgX/play.svg';
import { SuspendedStatus, useSuspendedStatus } from '@popup/popupX/shared/utils/pool-status-helpers';
import AccountCooldowns from '../../AccountCooldowns';
import { isRange, showValidatorAmount, showValidatorOpenStatus, showValidatorRestake } from '../util';
import { ValidationResultLocationState } from '../Result';

const REMOVE_STATE: ValidationResultLocationState = {
    type: 'remove',
    payload: { stake: CcdAmount.zero() },
};

const RESUME_STATE: ValidationResultLocationState = {
    type: 'resume',
    payload: { suspended: false },
};

function SuspendedStatusInfo({ suspendedStatus }: { suspendedStatus: SuspendedStatus }) {
    const { t } = useTranslation('x', { keyPrefix: 'earn.validator.status' });
    if (suspendedStatus === SuspendedStatus.isPrimedForSuspension) {
        return (
            <Card className="suspend-status-info">
                <Text.Main>{t('validationIsPrimedForSuspension')}</Text.Main>
                <Text.Capture>{t('validationIsPrimedForSuspensionInfo')}</Text.Capture>
            </Card>
        );
    }
    if (suspendedStatus === SuspendedStatus.suspended) {
        return (
            <Card className="suspend-status-info">
                <Text.Main>{t('validationSuspended')}</Text.Main>
                <Text.Capture>{t('validationSuspendedInfo')}</Text.Capture>
            </Card>
        );
    }
    return null;
}

export default function ValidatorStatus() {
    const { t } = useTranslation('x', { keyPrefix: 'earn.validator' });
    const accountInfo = useSelectedAccountInfo();
    const nav = useNavigate();
    const chainParams = useBlockChainParametersAboveV0();
    const suspendedStatus = useSuspendedStatus(accountInfo);

    if (accountInfo?.type !== AccountInfoType.Baker) {
        return <Navigate to={absoluteRoutes.settings.earn.path} />;
    }

    const { accountBaker, accountCooldowns } = accountInfo;

    if (accountBaker.version === 0 || chainParams === undefined) {
        // assume protocol version >= 4
        return null;
    }

    return (
        <Page className="validator-status">
            <Page.Top heading={t('status.title')} />
            <SuspendedStatusInfo suspendedStatus={suspendedStatus} />
            <div className="validator-status__action-buttons">
                <Button.IconTile
                    icon={<Stop />}
                    label={t('status.buttonStop')}
                    onClick={() => nav(absoluteRoutes.settings.earn.validator.submit.path, { state: REMOVE_STATE })}
                />
                <Button.IconTile
                    icon={<Arrows />}
                    label={t('status.buttonUpdate')}
                    onClick={() => nav(absoluteRoutes.settings.earn.validator.update.path)}
                />
                {suspendedStatus === SuspendedStatus.suspended ? (
                    <Button.IconTile
                        icon={<Play />}
                        label={t('status.buttonResume')}
                        onClick={() => nav(absoluteRoutes.settings.earn.validator.submit.path, { state: RESUME_STATE })}
                    />
                ) : (
                    <Button.IconTile
                        icon={<Pause />}
                        label={t('status.buttonSuspend')}
                        onClick={() => nav(absoluteRoutes.settings.earn.validator.selfSuspend.path)}
                    />
                )}
            </div>
            <AccountCooldowns cooldowns={accountCooldowns} />
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
        </Page>
    );
}

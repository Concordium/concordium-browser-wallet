import React from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@popup/popupX/shared/Card';
import Text from '@popup/popupX/shared/Text';
import { Cooldown, Timestamp } from '@concordium/web-sdk';
import { secondsToDaysRoundedDown } from '@shared/utils/time-helpers';
import { formatCcdAmount } from '@popup/popupX/shared/utils/helpers';

type Props = {
    cooldowns: Cooldown[];
};

export default function AccountCooldowns({ cooldowns }: Props) {
    const { t } = useTranslation('x', { keyPrefix: 'earn.cooldowns' });

    const timestampToRelativeDays = (ts: Timestamp.Type) => {
        const relative = (ts.value - BigInt(Date.now())) / 1000n;
        return Number(secondsToDaysRoundedDown(relative));
    };
    return (
        <>
            {cooldowns.map((c) => {
                const cdDays = timestampToRelativeDays(c.timestamp);
                return (
                    <Card className="account-cooldowns__item">
                        <Card.Row className="flex-column">
                            <Text.Capture className="account-cooldowns__em">{t('inactiveStake.label')}</Text.Capture>
                            <Text.Capture>{t('inactiveStake.description')}</Text.Capture>
                            <Text.Capture className="account-cooldowns__em">
                                {formatCcdAmount(c.amount)} CCD
                            </Text.Capture>
                        </Card.Row>
                        <Card.Row className="account-cooldowns__cooldown">
                            <Text.Capture>{t('cooldown.label')}</Text.Capture>
                            <span>
                                <Text.Capture className="account-cooldowns__em">{cdDays.toString()}</Text.Capture>{' '}
                                <Text.Capture>{t('cooldown.value', { count: cdDays })}</Text.Capture>
                            </span>
                        </Card.Row>
                    </Card>
                );
            })}
        </>
    );
}

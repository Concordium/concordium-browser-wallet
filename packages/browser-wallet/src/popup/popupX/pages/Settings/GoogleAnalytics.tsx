import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '@popup/popupX/shared/Text';
import { ToggleCheckbox } from '@popup/popupX/shared/Form/ToggleCheckbox';
import { useAtom } from 'jotai';
import { acceptedActivityTrackingAtom } from '@popup/store/settings';
import appTracker from '@shared/analytics';

function GoogleAnalytics() {
    const { t } = useTranslation('x', { keyPrefix: 'configuration' });
    const [activityTracking, setActivityTracking] = useAtom(acceptedActivityTrackingAtom);

    useEffect(() => {
        if (!activityTracking.loading && !activityTracking.value) {
            // Create tracking object for old user. Disabled by default.
            setActivityTracking(appTracker.createAnalyticsTrackingObject(false));
        }
    }, [activityTracking.loading]);

    const handleToggle = () => {
        if (activityTracking.value) {
            setActivityTracking({ ...activityTracking.value, accepted: !activityTracking.value.accepted });
        }
    };

    if (activityTracking.loading) {
        return null;
    }

    return (
        <div className="app-tracking">
            <Text.MainMedium>{t('googleAnalytics')}</Text.MainMedium>
            <ToggleCheckbox checked={activityTracking.value?.accepted} onChange={handleToggle} />
        </div>
    );
}

export default GoogleAnalytics;

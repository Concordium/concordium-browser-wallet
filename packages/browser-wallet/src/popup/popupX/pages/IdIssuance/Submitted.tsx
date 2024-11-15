import React, { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { noOp } from 'wallet-common-helpers';

import Button from '@popup/popupX/shared/Button';
import { ConfirmedIdCard, RejectedIdCard, PendingIdCard } from '@popup/popupX/shared/IdCard';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import { identitiesAtomWithLoading } from '@popup/store/identity';
import { CreationStatus } from '@shared/storage/types';
import { fullscreenPromptContext } from '@popup/popupX/page-layouts/FullscreenPromptLayout';
import { absoluteRoutes } from '@popup/popupX/constants/routes';

export default function IdIssuanceSubmitted() {
    const { t } = useTranslation('x', { keyPrefix: 'idIssuance.submitted' });
    const { loading, value: identities } = useAtomValue(identitiesAtomWithLoading);
    const { setReturnLocation, withClose } = useContext(fullscreenPromptContext);

    useEffect(() => {
        setReturnLocation(absoluteRoutes.settings.identities.path);
    }, [setReturnLocation]);

    if (loading) {
        return null;
    }

    const identity = identities.slice(-1)[0];

    return (
        <Page>
            <Page.Top heading={t('title')} />
            <Text.Capture>{t('description')}</Text.Capture>
            <div className="m-t-20">
                {identity.status === CreationStatus.Pending && <PendingIdCard identity={identity} />}
                {identity.status === CreationStatus.Rejected && <RejectedIdCard identity={identity} />}
                {identity.status === CreationStatus.Confirmed && <ConfirmedIdCard identity={identity} />}
            </div>
            <Page.Footer>
                <Button.Main className="m-t-20" label={t('buttonContinue')} onClick={withClose(noOp)} />
            </Page.Footer>
        </Page>
    );
}

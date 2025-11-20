import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';

import Button from '@popup/popupX/shared/Button';
import { ConfirmedIdCard, RejectedIdCard, PendingIdCard } from '@popup/popupX/shared/IdCard';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import { identitiesAtomWithLoading } from '@popup/store/identity';
import { CreationStatus, Identity } from '@shared/storage/types';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import { isSpawnedWindow } from '@popup/shared/window-helpers';
import { useNavigate } from 'react-router-dom';
import { useSendCredentialDeployment } from '@popup/popupX/pages/CreateAccount/CreateAccountConfirm';

function useSubmitAccountDeployment() {
    const deployment = useSendCredentialDeployment();
    return (identity: Identity) => {
        if (identity === undefined || identity.status !== CreationStatus.Confirmed) {
            throw new Error(`Invalid identity: ${identity}`);
        } else {
            return deployment.sendCredentialDeployment(identity);
        }
    };
}

export default function IdIssuanceSubmitted() {
    const { t } = useTranslation('x', { keyPrefix: 'idIssuance.submitted' });
    const { loading, value: identities } = useAtomValue(identitiesAtomWithLoading);
    const identity = identities.slice(-1)[0];

    const nav = useNavigate();
    const onCreateAccount = useSubmitAccountDeployment();

    if (loading) {
        return null;
    }

    const handleDone = () => {
        if (isSpawnedWindow) {
            window.close();
        } else {
            nav(absoluteRoutes.home.path, { replace: true });
        }
    };

    const handleCreateAccount = () => {
        onCreateAccount(identity).then(() => {
            handleDone();
        });
    };

    return (
        <Page>
            <Page.Top heading={t('title')} />
            <Text.Capture>{t('description')}</Text.Capture>
            <div className="m-t-20">
                {identity.status === CreationStatus.Pending && <PendingIdCard identity={identity} />}
                {identity.status === CreationStatus.Rejected && <RejectedIdCard identity={identity} />}
                {identity.status === CreationStatus.Confirmed && (
                    <ConfirmedIdCard identity={identity} shownAttributes={['idDocType', 'idDocNo']} />
                )}
            </div>
            <Page.Footer>
                {identity.status === CreationStatus.Confirmed ? (
                    <Button.Main label={t('buttonCreateAccount')} onClick={handleCreateAccount} />
                ) : (
                    <Button.Main label={t('buttonContinue')} onClick={handleDone} />
                )}
            </Page.Footer>
        </Page>
    );
}

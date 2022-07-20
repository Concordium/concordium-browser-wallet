import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { pendingIdentitiesAtom } from '@popup/store/settings';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import IdCard from '@popup/shared/IdCard';
import PageHeader from '@popup/shared/PageHeader';
import { noOp } from 'wallet-common-helpers';
import Button from '@popup/shared/Button';

// TODO duplicated from background
type Response =
    | {
          status: 'Success';
          result: string;
      }
    | {
          status: 'Aborted';
      };

interface Location {
    state: {
        payload: Response;
    };
}

// TODO check status on identity
// TODO add handlers for buttons

export default function IdentityIssuanceEnd() {
    const { state } = useLocation() as Location;
    const { t } = useTranslation('identityIssuance');
    const [pendingIdentities, updatePendingIdentities] = useAtom(pendingIdentitiesAtom);
    const [failed, setFailed] = useState<boolean>(false);

    useEffect(() => {
        const identity = pendingIdentities.pop();
        if (!identity) {
            throw new Error('No pending identity');
        }
        if (state.payload.status === 'Success') {
            identity.location = state.payload.result;
            updatePendingIdentities(pendingIdentities.concat([identity]));
        } else {
            setFailed(true);
        }
    }, []);

    return (
        <>
            {failed && (
                <>
                    <PageHeader>{t('title')}</PageHeader>
                    <p>aborted</p>
                    <Button>{t('continue')}</Button>
                </>
            )}
            {!failed && (
                <>
                    <PageHeader>{t('title')}</PageHeader>
                    <p>{t('explanation')}</p>
                    <IdCard name="Identity" provider={<p>Test</p>} status="pending" onNameChange={noOp} />
                    <Button>{t('continue')}</Button>
                </>
            )}
        </>
    );
}

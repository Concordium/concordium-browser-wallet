import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { identitiesAtom, pendingIdentityAtom } from '@popup/store/settings';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import IdCard from '@popup/shared/IdCard';
import PageHeader from '@popup/shared/PageHeader';
import { noOp } from 'wallet-common-helpers';
import Button from '@popup/shared/Button';
import { IdentityStatus } from '@shared/storage/types';

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
    const [pendingIdentity, setPendingIdentity] = useAtom(pendingIdentityAtom);
    const [identities, setIdentities] = useAtom(identitiesAtom);
    const [failed, setFailed] = useState<boolean>(false);

    useEffect(() => {
        if (!pendingIdentity) {
            throw new Error('No pending identity');
        }
        if (state.payload.status === 'Success') {
            setIdentities(
                identities.concat({
                    ...pendingIdentity,
                    status: IdentityStatus.Pending,
                    location: state.payload.result,
                })
            );
        } else {
            setFailed(true);
        }
        setPendingIdentity(undefined);
    }, []);

    return (
        <>
            <PageHeader>{t('title')}</PageHeader>
            {failed && <p>aborted</p>}
            {!failed && (
                <>
                    <p>{t('explanation')}</p>
                    <IdCard name="Identity" provider={<p>Test</p>} status="pending" onNameChange={noOp} />
                </>
            )}
            <Button>{t('continue')}</Button>
        </>
    );
}

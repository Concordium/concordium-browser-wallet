import React, { useEffect, useState, useContext } from 'react';
import { useAtom } from 'jotai';
import { identitiesAtom, pendingIdentityAtom } from '@popup/store/identity';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import IdCard from '@popup/shared/IdCard';
import PageHeader from '@popup/shared/PageHeader';
import { noOp } from 'wallet-common-helpers';
import Button from '@popup/shared/Button';
import { IdentityStatus } from '@shared/storage/types';
import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import { IdentityIssuanceBackgroundResponse } from '@shared/utils/identity-helpers';

interface Location {
    state: {
        payload: IdentityIssuanceBackgroundResponse;
    };
}

interface Props {
    onFinish: () => void;
}

// TODO start checking status on identity

export default function IdentityIssuanceEnd({ onFinish }: Props) {
    const { state } = useLocation() as Location;
    const { t } = useTranslation('identityIssuance');
    const [pendingIdentity, setPendingIdentity] = useAtom(pendingIdentityAtom);
    const [identities, setIdentities] = useAtom(identitiesAtom);
    const [aborted, setAborted] = useState<boolean>(false);
    const { withClose, onClose } = useContext(fullscreenPromptContext);
    // TODO Get provider icon
    const providerVisual = <p>Test</p>;

    useEffect(() => onClose(onFinish), [onClose, onFinish]);

    useEffect(() => {
        if (pendingIdentity) {
            if (state.payload.status === 'Success') {
                setIdentities(
                    identities.concat({
                        ...pendingIdentity,
                        status: IdentityStatus.Pending,
                        location: state.payload.result,
                    })
                );
            } else {
                setAborted(true);
            }
            setPendingIdentity(undefined);
        }
    }, [pendingIdentity]);

    return (
        <>
            <PageHeader>{t('title')}</PageHeader>
            <div className="identity-issuance__end">
                {aborted && <p className="identity-issuance__text">{t('abortExplanation')}</p>}
                {!aborted && (
                    <>
                        <p className="identity-issuance__text">{t('successExplanation')}</p>
                        <IdCard
                            className="identity-issuance__card"
                            name="Identity"
                            provider={providerVisual}
                            status="pending"
                            onNameChange={noOp}
                        />
                    </>
                )}
                <Button width="wide" onClick={withClose(noOp)} className="identity-issuance__button">
                    {t('continue')}
                </Button>
            </div>
        </>
    );
}

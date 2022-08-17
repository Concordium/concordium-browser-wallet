import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { identitiesAtom, pendingIdentityAtom, identityProvidersAtom } from '@popup/store/identity';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import IdCard from '@popup/shared/IdCard';
import PageHeader from '@popup/shared/PageHeader';
import { noOp } from 'wallet-common-helpers';
import Button from '@popup/shared/Button';
import { IdentityStatus } from '@shared/storage/types';
import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import { IdentityIssuanceBackgroundResponse } from '@shared/utils/identity-helpers';
import IdentityProviderIcon from '@popup/shared/IdentityProviderIcon';

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
    const providers = useAtomValue(identityProvidersAtom);
    const [pendingIdentity, setPendingIdentity] = useAtom(pendingIdentityAtom);
    const [identities, setIdentities] = useAtom(identitiesAtom);
    const [aborted, setAborted] = useState<boolean>(false);
    const { withClose, onClose } = useContext(fullscreenPromptContext);

    const identityProvider = useMemo(() => providers.find((p) => p.ipInfo.ipIdentity === pendingIdentity.provider));
    const name = useMemo(() => pendingIdentity.name, []);

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
                            name={name}
                            provider={<IdentityProviderIcon provider={identityProvider} />}
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

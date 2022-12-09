import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAtom, useAtomValue } from 'jotai';
import { AttributeKey } from '@concordium/web-sdk';
import { formatAttributeValue, compareAttributes } from 'wallet-common-helpers';

import FingerprintIcon from '@assets/svg/fingerprint.svg';
import { identityProvidersAtom, selectedIdentityAtom } from '@popup/store/identity';
import IdCard from '@popup/shared/IdCard';
import { CreationStatus } from '@shared/storage/types';
import IdentityProviderIcon from '@popup/shared/IdentityProviderIcon';
import Button from '@popup/shared/Button';
import { absoluteRoutes } from '@popup/constants/routes';
import { useGetAttributeName } from '@popup/shared/utils/identity-helpers';

export default function Identity() {
    const { t } = useTranslation('identity');
    const nav = useNavigate();
    const [selectedIdentity, updateSelectedIdentity] = useAtom(selectedIdentityAtom);
    const providers = useAtomValue(identityProvidersAtom);
    const getAttributeName = useGetAttributeName();

    const identityProvider = useMemo(
        () => providers.find((p) => p.ipInfo.ipIdentity === selectedIdentity?.providerIndex),
        [providers.length, selectedIdentity?.providerIndex]
    );

    if (!selectedIdentity) {
        return (
            <div className="flex-column align-center h-full">
                <p className="m-t-20 m-h-40">{t('noIdentities')}</p>
                <Button
                    className="m-b-40 m-t-auto"
                    width="wide"
                    onClick={() => nav(absoluteRoutes.home.identities.add.path)}
                >
                    {t('request')}
                </Button>
            </div>
        );
    }

    const attributes =
        selectedIdentity.status === CreationStatus.Confirmed &&
        (selectedIdentity.idObject.value.attributeList.chosenAttributes as Record<AttributeKey, string>);

    return (
        <div className="flex-column align-center">
            <IdCard
                name={selectedIdentity.name}
                provider={<IdentityProviderIcon provider={identityProvider} />}
                status={selectedIdentity.status}
                onNameChange={(name) => updateSelectedIdentity({ ...selectedIdentity, name })}
                className="m-t-20"
            />
            {attributes && (
                <div className="identity__attributes">
                    <div className="identity__attributes-row p-v-5">
                        <div className="identity__attributes-left">
                            <FingerprintIcon className="identity__fingerprint-icon" />
                            <div className="m-l-5">Identity attributes</div>
                        </div>
                    </div>
                    {Object.keys(attributes)
                        .map((k) => k as AttributeKey)
                        .sort(compareAttributes)
                        .map((attributeKey: AttributeKey) => (
                            <div key={attributeKey} className="identity__attributes-row">
                                <div className="identity__attributes-left">{getAttributeName(attributeKey)}</div>
                                <div className="identity__attributes-right">
                                    {formatAttributeValue(attributeKey, attributes[attributeKey])}
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}

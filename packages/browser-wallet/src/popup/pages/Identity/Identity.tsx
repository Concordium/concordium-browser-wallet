import React, { useEffect, useMemo } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { identityProvidersAtom, selectedIdentityAtom } from '@popup/store/identity';
import IdCard from '@popup/shared/IdCard';
import { CreationStatus } from '@shared/storage/types';
import { AttributeKey } from '@concordium/web-sdk';
import attributeNames from 'wallet-common-helpers/constants/attributeNames.json';
import { formatAttributeValue, compareAttributes } from 'wallet-common-helpers';
import { getIdObject } from '@shared/utils/identity-helpers';
import IdentityProviderIcon from '@popup/shared/IdentityProviderIcon';

export default function Identity() {
    const [selectedIdentity, updateSelectedIdentity] = useAtom(selectedIdentityAtom);
    const providers = useAtomValue(identityProvidersAtom);

    const identityProvider = useMemo(
        () => providers.find((p) => p.ipInfo.ipIdentity === selectedIdentity?.provider),
        [providers.length]
    );

    useEffect(() => {
        // TODO: Check identity status in background
        if (selectedIdentity?.status === CreationStatus.Pending) {
            getIdObject(selectedIdentity.location).then((response) => {
                if (response.error) {
                    updateSelectedIdentity({
                        ...selectedIdentity,
                        status: CreationStatus.Rejected,
                        error: response.error,
                    });
                } else {
                    updateSelectedIdentity({
                        ...selectedIdentity,
                        status: CreationStatus.Confirmed,
                        idObject: response.token.identityObject,
                    });
                }
            });
        }
    }, [selectedIdentity?.id]);

    if (!selectedIdentity) {
        return null;
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
                    {Object.keys(attributes)
                        .map((k) => k as AttributeKey)
                        .sort(compareAttributes)
                        .map((attributeKey: AttributeKey) => (
                            <div key={attributeKey} className="identity__attributes-row">
                                <div className="identity__attributes-left">
                                    {attributeNames[attributeKey] || attributeKey}
                                </div>
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

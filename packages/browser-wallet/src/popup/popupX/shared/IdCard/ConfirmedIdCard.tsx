import React, { useMemo } from 'react';
import { useDisplayAttributeValue, useGetAttributeName } from '@popup/shared/utils/identity-helpers';
import { identityProvidersAtom } from '@popup/store/identity';
import { useAtomValue } from 'jotai';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext';
import { ConfirmedIdentity, WalletCredential } from '@shared/storage/types';
import { compareAttributes, displayAsCcd } from 'wallet-common-helpers';
import { credentialsAtomWithLoading } from '@popup/store/account';
import { AttributeKey } from '@concordium/web-sdk';
import { displayNameAndSplitAddress } from '@popup/shared/utils/account-helpers';
import IdCard, { IdCardAccountInfo, IdCardAttributeInfo } from './IdCard';

function CcdBalance({ credential }: { credential: WalletCredential }) {
    const accountInfo = useAccountInfo(credential);
    const balance =
        accountInfo === undefined ? '' : displayAsCcd(accountInfo.accountAmount.microCcdAmount, false, true);
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{balance}</>;
}

function fallbackIdentityName(index: number) {
    return `Identity ${index + 1}`;
}

export type ConfirmedIdentityProps = {
    /** Identity to show. */
    identity: ConfirmedIdentity;
    /** Disable showing accounts created with this identity. */
    hideAccounts?: boolean;
    /** Limit the shown attributes to the following list, when undefined all attributes will be shown. */
    shownAttributes?: AttributeKey[];
    /** Callback when user changes the name of the identity, no edit button is show when not defined. */
    onNewName?: (name: string) => void;
};

export default function ConfirmedIdCard({
    identity,
    hideAccounts,
    shownAttributes,
    onNewName,
}: ConfirmedIdentityProps) {
    const displayAttribute = useDisplayAttributeValue();
    const getAttributeName = useGetAttributeName();
    const providers = useAtomValue(identityProvidersAtom);
    const credentials = useAtomValue(credentialsAtomWithLoading);
    const provider = providers.find((p) => p.ipInfo.ipIdentity === identity.providerIndex);
    const providerName = provider?.ipInfo.ipDescription.name ?? 'Unknown';
    const rowsIdInfo: IdCardAttributeInfo[] = useMemo(
        () =>
            Object.entries(identity.idObject.value.attributeList.chosenAttributes)
                .filter(([key]) =>
                    shownAttributes === undefined ? true : shownAttributes.includes(key as AttributeKey)
                )
                .sort(([left], [right]) => compareAttributes(left, right))
                .map(([key, value]) => ({
                    key: getAttributeName(key as AttributeKey),
                    value: displayAttribute(key, value),
                })),
        [identity]
    );
    const rowsConnectedAccounts = useMemo(() => {
        if (hideAccounts) {
            return undefined;
        }
        const connectedAccounts = credentials.value.flatMap((cred): IdCardAccountInfo[] =>
            cred.identityIndex !== identity.index
                ? []
                : [
                      {
                          address: displayNameAndSplitAddress(cred),
                          amount: <CcdBalance credential={cred} />,
                      },
                  ]
        );
        return connectedAccounts.length === 0 ? undefined : connectedAccounts;
    }, [credentials, identity, hideAccounts]);
    return (
        <IdCard
            identityName={identity.name}
            onNewName={onNewName}
            identityNameFallback={fallbackIdentityName(identity.index)}
            idProviderName={providerName}
            rowsIdInfo={rowsIdInfo}
            rowsConnectedAccounts={rowsConnectedAccounts}
        />
    );
}

import React, { useMemo } from 'react';
import Plus from '@assets/svgX/plus.svg';
import Button from '@popup/popupX/shared/Button';
import Page from '@popup/popupX/shared/Page';
import { useTranslation } from 'react-i18next';
import IdCard from '@popup/popupX/shared/IdCard';
import { identitiesAtom, identityProvidersAtom } from '@popup/store/identity';
import { useAtom, useAtomValue } from 'jotai';
import { useDisplayAttributeValue, useGetAttributeName } from '@popup/shared/utils/identity-helpers';
import { CreationStatus, ConfirmedIdentity, WalletCredential } from '@shared/storage/types';
import { AttributeKey } from '@concordium/web-sdk';
import { IdCardAccountInfo, IdCardAttributeInfo } from '@popup/popupX/shared/IdCard/IdCard';
import { credentialsAtomWithLoading } from '@popup/store/account';
import { displayNameAndSplitAddress } from '@popup/shared/utils/account-helpers';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext';
import { compareAttributes, displayAsCcd } from 'wallet-common-helpers';

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

type ConfirmedIdentityProps = { identity: ConfirmedIdentity; onNewName: (name: string) => void };

function ConfirmedIdCard({ identity, onNewName }: ConfirmedIdentityProps) {
    const displayAttribute = useDisplayAttributeValue();
    const getAttributeName = useGetAttributeName();
    const providers = useAtomValue(identityProvidersAtom);
    const credentials = useAtomValue(credentialsAtomWithLoading);
    const provider = providers.find((p) => p.ipInfo.ipIdentity === identity.providerIndex);
    const providerName = provider?.ipInfo.ipDescription.name ?? 'Unknown';
    const rowsIdInfo: IdCardAttributeInfo[] = useMemo(
        () =>
            Object.entries(identity.idObject.value.attributeList.chosenAttributes)
                .sort(([left], [right]) => compareAttributes(left, right))
                .map(([key, value]) => ({
                    key: getAttributeName(key as AttributeKey),
                    value: displayAttribute(key, value),
                })),
        [identity]
    );
    const rowsConnectedAccounts = useMemo(() => {
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
    }, [credentials, identity]);
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

export default function IdCards() {
    const { t } = useTranslation('x', { keyPrefix: 'idCards' });
    const [identities, setIdentities] = useAtom(identitiesAtom);
    const onNewName = (index: number) => (newName: string) => {
        const identitiesClone = [...identities];
        identitiesClone[index] = { ...identities[index], name: newName };
        setIdentities(identitiesClone);
    };
    return (
        <Page className="id-cards-x">
            <Page.Top heading={t('idCards')}>
                <Button.Icon icon={<Plus />} />
            </Page.Top>
            <Page.Main>
                {identities.map((id, index) => {
                    switch (id.status) {
                        case CreationStatus.Confirmed:
                            return (
                                <ConfirmedIdCard
                                    identity={id}
                                    key={`${id.providerIndex}:${id.index}`}
                                    onNewName={onNewName(index)}
                                />
                            );
                        case CreationStatus.Pending:
                            return null;
                        case CreationStatus.Rejected:
                            return null;
                        default:
                            return <>Unsupported</>;
                    }
                })}
            </Page.Main>
        </Page>
    );
}

import React from 'react';
import Plus from '@assets/svgX/plus.svg';
import Button from '@popup/popupX/shared/Button';
import Page from '@popup/popupX/shared/Page';
import { useTranslation } from 'react-i18next';
import { identitiesAtom } from '@popup/store/identity';
import { useAtom } from 'jotai';
import { CreationStatus } from '@shared/storage/types';
import { ConfirmedIdCard } from '@popup/popupX/shared/IdCard';

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

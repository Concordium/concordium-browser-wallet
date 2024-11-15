import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';

import Plus from '@assets/svgX/plus.svg';
import Button from '@popup/popupX/shared/Button';
import Page from '@popup/popupX/shared/Page';
import { identitiesAtom } from '@popup/store/identity';
import { CreationStatus } from '@shared/storage/types';
import { ConfirmedIdCard, RejectedIdCard } from '@popup/popupX/shared/IdCard';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import PendingIdCard from '@popup/popupX/shared/IdCard/PendingIdCard';

export default function IdCards() {
    const { t } = useTranslation('x', { keyPrefix: 'idCards' });
    const nav = useNavigate();
    const [identities, setIdentities] = useAtom(identitiesAtom);
    const onNewName = (index: number) => (newName: string) => {
        const identitiesClone = [...identities];
        identitiesClone[index] = { ...identities[index], name: newName };
        setIdentities(identitiesClone);
    };
    return (
        <Page className="id-cards-x">
            <Page.Top heading={t('idCards')}>
                <Button.Icon icon={<Plus />} onClick={() => nav(absoluteRoutes.settings.identities.create.path)} />
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
                            return <PendingIdCard identity={id} key={`${id.providerIndex}:${id.index}`} />;
                        case CreationStatus.Rejected:
                            return <RejectedIdCard identity={id} key={`${id.providerIndex}:${id.index}`} />;
                        default:
                            return <>Unsupported</>;
                    }
                })}
            </Page.Main>
        </Page>
    );
}

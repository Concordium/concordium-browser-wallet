import React from 'react';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import { useTranslation } from 'react-i18next';
import { identitiesAtom } from '@popup/store/identity';
import { useAtomValue } from 'jotai';
import { ConfirmedIdentity, CreationStatus } from '@shared/storage/types';
import { ConfirmedIdCard } from '@popup/popupX/shared/IdCard';
import Button from '@popup/popupX/shared/Button';
import { generatePath, useNavigate } from 'react-router-dom';
import { absoluteRoutes } from '@popup/popupX/constants/routes';

export default function CreateAccount() {
    const { t } = useTranslation('x', { keyPrefix: 'createAccount' });
    const identities = useAtomValue(identitiesAtom);
    const nav = useNavigate();
    const navToCreateAccountConfirm = (identity: ConfirmedIdentity) => () =>
        nav(
            generatePath(absoluteRoutes.settings.createAccount.confirm.path, {
                identityProviderIndex: identity.providerIndex.toString(),
                identityIndex: identity.index.toString(),
            })
        );
    return (
        <Page className="create-account-x">
            <Page.Top heading={t('selectIdentity')} />
            <Page.Main>
                <Text.MainRegular>{t('selectIdentityDescription')}</Text.MainRegular>
                {identities.map((id) => {
                    switch (id.status) {
                        case CreationStatus.Confirmed:
                            return (
                                <Button.Base
                                    className="id-card-button"
                                    key={`${id.providerIndex}:${id.index}`}
                                    onClick={navToCreateAccountConfirm(id)}
                                >
                                    <ConfirmedIdCard
                                        identity={id}
                                        shownAttributes={['idDocType', 'idDocNo']}
                                        hideAccounts
                                    />
                                </Button.Base>
                            );
                        case CreationStatus.Pending:
                            return null;
                        case CreationStatus.Rejected:
                            return null;
                        default:
                            return null;
                    }
                })}
            </Page.Main>
        </Page>
    );
}

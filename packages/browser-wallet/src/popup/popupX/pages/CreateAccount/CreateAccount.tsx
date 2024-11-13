import React, { useMemo } from 'react';
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

/**
 * Get the valid identities, which is Identities that are confirmed by the ID provider and are not
 * expired.
 * This is not recomputed by change of current time, meaning the returned identities might become
 * expired over time.
 */
function useValidIdentities(): ConfirmedIdentity[] {
    const identities = useAtomValue(identitiesAtom);
    return useMemo(() => {
        const now = new Date();
        return identities.flatMap((id) => {
            if (id.status !== CreationStatus.Confirmed) {
                return [];
            }
            const validToDate = new Date(id.idObject.value.attributeList.validTo);
            if (validToDate < now) {
                return [];
            }
            return [id];
        });
    }, [identities]);
}

export default function CreateAccount() {
    const { t } = useTranslation('x', { keyPrefix: 'createAccount' });
    const nav = useNavigate();
    const navToCreateAccountConfirm = (identity: ConfirmedIdentity) => () =>
        nav(
            generatePath(absoluteRoutes.settings.createAccount.confirm.path, {
                identityProviderIndex: identity.providerIndex.toString(),
                identityIndex: identity.index.toString(),
            })
        );
    const validIdentities = useValidIdentities();

    return (
        <Page className="create-account-x">
            <Page.Top heading={t('selectIdentity')} />
            <Page.Main>
                <Text.MainRegular>{t('selectIdentityDescription')}</Text.MainRegular>
                {validIdentities.length === 0 ? (
                    <p className="m-t-40">
                        <Text.Capture>{t('noValidIdentities')}</Text.Capture>
                    </p>
                ) : (
                    validIdentities.map((id) => (
                        <Button.Base
                            className="id-card-button"
                            key={`${id.providerIndex}:${id.index}`}
                            onClick={navToCreateAccountConfirm(id)}
                        >
                            <ConfirmedIdCard identity={id} shownAttributes={['idDocType', 'idDocNo']} hideAccounts />
                        </Button.Base>
                    ))
                )}
            </Page.Main>
        </Page>
    );
}

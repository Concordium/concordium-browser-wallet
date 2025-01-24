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
import { compareYearMonth, getCurrentYearMonth } from 'wallet-common-helpers';

/**
 * Get the valid identities, which is Identities that are confirmed by the ID provider and are not
 * expired.
 * This is not recomputed by change of current time, meaning the returned identities might become
 * expired over time.
 */
function useValidIdentities(): ConfirmedIdentity[] {
    const identities = useAtomValue(identitiesAtom);
    return useMemo(() => {
        const now = getCurrentYearMonth();
        return identities.flatMap((id) => {
            if (id.status !== CreationStatus.Confirmed) {
                return [];
            }
            // Negative number is indicating that `validTo` is before `now`, therefore expired.
            const isExpired = compareYearMonth(id.idObject.value.attributeList.validTo, now) < 0;
            if (isExpired) {
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
    const navToCreateIdentity = () => nav(absoluteRoutes.settings.identities.create.path);

    return (
        <Page className="create-account-x">
            <Page.Top heading={t('selectIdentity')} />
            <Page.Main>
                <Text.Capture>{t('selectIdentityDescription')}</Text.Capture>
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
            <Page.Footer>
                {validIdentities.length === 0 && (
                    <Button.Main label={t('createIdentity')} onClick={navToCreateIdentity} />
                )}
            </Page.Footer>
        </Page>
    );
}

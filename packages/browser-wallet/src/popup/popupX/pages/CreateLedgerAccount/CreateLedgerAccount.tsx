/* eslint-disable no-console */
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
 * Get the valid identities for Ledger account creation
 */
function useValidIdentities(): ConfirmedIdentity[] {
    const identities = useAtomValue(identitiesAtom);
    return useMemo(() => {
        const now = getCurrentYearMonth();
        return identities.flatMap((id) => {
            if (id.status !== CreationStatus.Confirmed) {
                return [];
            }
            const isExpired = compareYearMonth(id.idObject.value.attributeList.validTo, now) < 0;
            if (isExpired) {
                return [];
            }
            return [id];
        });
    }, [identities]);
}

export default function CreateLedgerAccount() {
    const { t } = useTranslation('x', { keyPrefix: 'createLedgerAccount' });
    const nav = useNavigate();
    const navToConfirm = (identity: ConfirmedIdentity) => () => {
        console.log('Identity selected:', identity);
        const path = generatePath(absoluteRoutes.settings.accounts.createLedger.confirm.path, {
            identityProviderIndex: identity.providerIndex.toString(),
            identityIndex: identity.index.toString(),
        });
        console.log('Navigating to:', path);
        nav(path);
    };
    const validIdentities = useValidIdentities();
    const navToCreateIdentity = () => nav(absoluteRoutes.settings.identities.create.path);

    console.log('Valid identities count:', validIdentities.length);

    return (
        <Page className="create-ledger-account-x">
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
                            onClick={navToConfirm(id)}
                            disabled={false}
                            style={{ cursor: 'pointer', opacity: 1 }}
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

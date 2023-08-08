import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAtomValue, useSetAtom } from 'jotai';
import IdentityProviderIcon from '@popup/shared/IdentityProviderIcon';

import IdCard from '@popup/shared/IdCard';
import { selectedIdentityIndexAtom, identityProvidersAtom } from '@popup/store/identity';
import { Identity, WalletCredential, ConfirmedIdentity } from '@shared/storage/types';
import { absoluteRoutes } from '@popup/constants/routes';
import Button from '@popup/shared/Button';
import { credentialsAtom } from '@popup/store/account';
import { getMaxAccountsForIdentity, isIdentityOfCredential } from '@shared/utils/identity-helpers';
import { getNextEmptyCredNumber } from '@popup/shared/utils/account-helpers';
import Modal from '@popup/shared/Modal';
import i18n from '@popup/shell/i18n';
import { useConfirmedIdentities } from '@popup/shared/utils/identity-helpers';

function validateValidForAccountCreation(identity: ConfirmedIdentity, creds: WalletCredential[]): string | undefined {
    const nextCredNumber = getNextEmptyCredNumber(creds);
    if (nextCredNumber >= getMaxAccountsForIdentity(identity)) {
        return i18n.t('maxAccountsReached', { ns: 'addAccount' });
    }
    return undefined;
}

export default function ChooseIdentity() {
    const { t } = useTranslation('addAccount');
    const identities = useConfirmedIdentities();
    const setSelectedIdentityIndex = useSetAtom(selectedIdentityIndexAtom);
    const nav = useNavigate();
    const providers = useAtomValue(identityProvidersAtom);
    const credentials = useAtomValue(credentialsAtom);
    const [modalMessage, setModalMessage] = useState<string>();

    const findProvider = useCallback(
        (identity: Identity) => providers.find((p) => p.ipInfo.ipIdentity === identity.providerIndex),
        [providers]
    );

    if (identities.loading) {
        return null;
    }

    if (!identities.value.length) {
        return (
            <div className="flex-column align-center h-full">
                <p className="m-t-20 m-h-40">{t('noIdentities')}</p>
                <Button
                    className="add-account-page__no-identity-button"
                    width="wide"
                    onClick={() => nav(absoluteRoutes.home.identities.add.path)}
                >
                    {t('createIdentity')}
                </Button>
            </div>
        );
    }

    return (
        <div className="flex-column align-center">
            <Modal open={Boolean(modalMessage)} onClose={() => setModalMessage(undefined)}>
                {modalMessage}
            </Modal>
            <p className="m-t-20 text-center p-h-10">{t('chooseIdentity')}</p>
            {identities.value.map((identity, i) => {
                const credsOfCurrentIdentity = credentials.filter(isIdentityOfCredential(identity));
                const reason = validateValidForAccountCreation(identity, credsOfCurrentIdentity);

                return (
                    <IdCard
                        name={identity.name}
                        key={`${identity.providerIndex}-${identity.index}`}
                        provider={<IdentityProviderIcon provider={findProvider(identity)} />}
                        status={identity.status}
                        disabled={Boolean(reason)}
                        className="m-t-10"
                        onClick={
                            reason
                                ? () => setModalMessage(reason)
                                : () => {
                                      setSelectedIdentityIndex(i);
                                      nav('confirm');
                                  }
                        }
                    />
                );
            })}
        </div>
    );
}

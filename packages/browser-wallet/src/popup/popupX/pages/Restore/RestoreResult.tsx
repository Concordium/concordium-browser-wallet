import React, { useContext, useEffect, useMemo } from 'react';
import ArrowRight from '@assets/svgX/arrow-right.svg';
import Button from '@popup/popupX/shared/Button';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import { useTranslation } from 'react-i18next';
import IdCard from '@popup/popupX/shared/IdCard';
import { BackgroundResponseStatus, IdentityIdentifier, RecoveryBackgroundResponse } from '@shared/utils/types';
import { useAtom, useAtomValue } from 'jotai';
import { identitiesAtom, identityProvidersAtom } from '@popup/store/identity';
import { credentialsAtom, selectedAccountAtom } from '@popup/store/account';
import { identityMatch, isIdentityOfCredential } from '@shared/utils/identity-helpers';
import { displaySplitAddressShort } from '@popup/shared/utils/account-helpers';
import { displayAsCcd, noOp } from 'wallet-common-helpers';
import { Identity } from '@shared/storage/types';
import { useLocation, useNavigate } from 'react-router-dom';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import { fullscreenPromptContext } from '@popup/popupX/page-layouts/FullscreenPromptLayout';

function AccountLink({ account, balance }: { account: string; balance: string }) {
    const nav = useNavigate();
    const navToAccounts = () => nav(absoluteRoutes.settings.accounts.path);
    return (
        <div className="account-link">
            <Text.Capture>{account}</Text.Capture>
            {balance}
            <Button.Icon className="transparent" icon={<ArrowRight />} onClick={navToAccounts} />
        </div>
    );
}

interface Props {
    added: {
        accounts: { address: string; balance: string }[];
        identities: IdentityIdentifier[];
    };
}

export function DisplaySuccess({ added }: Props) {
    const { t } = useTranslation('x', { keyPrefix: 'restore' });
    const identities = useAtomValue(identitiesAtom);
    const providers = useAtomValue(identityProvidersAtom);
    const credentials = useAtomValue(credentialsAtom);
    const [selectedAccount, setSelectedAccount] = useAtom(selectedAccountAtom);

    const addedAccounts = useMemo(
        () => credentials.filter((cred) => added.accounts.some((pair) => cred.address === pair.address)),
        [credentials.length, added.accounts.length]
    );
    // Also includes identities that existed but have had accounts added.
    const addedIdentities = useMemo(
        () =>
            identities.filter(
                (id) => added.identities.some(identityMatch(id)) || addedAccounts.some(isIdentityOfCredential(id))
            ),
        [identities.length, addedAccounts.length, added.identities.length]
    );

    const getProvider = (identity: Identity) => {
        const provider = providers.find((p) => p.ipInfo.ipIdentity === identity.providerIndex);
        const idProviderName = provider?.ipInfo.ipDescription.name ?? t('unknown');
        return idProviderName;
    };

    useEffect(() => {
        if (!selectedAccount && credentials.length) {
            setSelectedAccount(credentials[0].address);
        }
    }, [selectedAccount, credentials.length]);

    return (
        <>
            <Text.Capture>{t(addedIdentities.length ? 'success' : 'noneFound')}</Text.Capture>
            <div className="restore-result-x__results">
                {addedIdentities.map((identity) => (
                    <IdCard
                        key={`${identity.providerIndex}-${identity.index}`}
                        title={identity.name + (!added.identities.some(identityMatch(identity)) ? t('existed') : '')}
                        subtitle={t('verifiedBy', { idProviderName: getProvider(identity) })}
                    >
                        <IdCard.Content>
                            {addedAccounts.filter(isIdentityOfCredential(identity)).map((cred) => (
                                <IdCard.ContentRow key={cred.credId}>
                                    <Text.MainMedium>
                                        <AccountLink
                                            account={displaySplitAddressShort(cred.address)}
                                            balance={displayAsCcd(
                                                added.accounts.find((pair) => pair.address === cred.address)?.balance ||
                                                    BigInt(0),
                                                false,
                                                true
                                            )}
                                        />
                                    </Text.MainMedium>
                                </IdCard.ContentRow>
                            ))}
                        </IdCard.Content>
                    </IdCard>
                ))}
            </div>
        </>
    );
}

interface Location {
    state: {
        payload: RecoveryBackgroundResponse;
    };
}

export default function RestoreResult() {
    const { t } = useTranslation('x', { keyPrefix: 'restore' });
    const { state } = useLocation() as Location;
    const { payload } = state;
    const { setReturnLocation, withClose } = useContext(fullscreenPromptContext);
    const nav = useNavigate();
    const navToRecoveryMain = () => nav(absoluteRoutes.settings.restore.main.path);

    useEffect(() => setReturnLocation(absoluteRoutes.home.path), []);

    return (
        <Page className="restore-result-x">
            <Page.Top heading={t('result')} />
            {payload.status === BackgroundResponseStatus.Success && (
                <>
                    <Page.Main>
                        <DisplaySuccess added={payload.added} />
                    </Page.Main>
                    <Page.Footer>
                        <Button.Main label={t('continue')} onClick={withClose(noOp)} />
                    </Page.Footer>
                </>
            )}
            {payload.status === BackgroundResponseStatus.Error && (
                <>
                    <Page.Main>
                        <Text.Capture>{t('error')}</Text.Capture>
                        <Text.Capture>{payload.reason}</Text.Capture>
                    </Page.Main>
                    <Page.Footer>
                        <Button.Main label={t('retry')} onClick={navToRecoveryMain} />
                    </Page.Footer>
                </>
            )}
        </Page>
    );
}

import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import { credentialsAtom, selectedAccountAtom, storedConnectedSitesAtom } from '@popup/store/account';
import { sessionPasscodeAtom } from '@popup/store/settings';
import { useAtom, useAtomValue } from 'jotai';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import ExternalRequestLayout from '@popup/page-layouts/ExternalRequestLayout';
import Button from '@popup/shared/Button';
import { displayUrl } from '@popup/shared/utils/string-helpers';
import { displaySplitAddress } from '@popup/shared/utils/account-helpers';
import { WalletCredential } from '@shared/storage/types';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext';
import AccountInfoListenerContextProvider from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import { displayAsCcd } from 'wallet-common-helpers';
import { Checkbox } from '@popup/shared/Form/Checkbox';

type Props = {
    onAllow(): void;
    onReject(): void;
};

type ItemProps = {
    account: WalletCredential;
    checked: boolean;
    selected: boolean;
    identityName: string;
};

function AccountListItem({ account, checked, selected, identityName }: ItemProps) {
    const accountInfo = useAccountInfo(account);
    const totalBalance = useMemo(() => accountInfo?.accountAmount || 0n, [accountInfo?.accountAmount]);

    return (
        <div className={'connect-accounts-request-accounts__account-item'}>
            <div className="connect-accounts-request-accounts__account-item__primary">
                <div className="flex align-center">
                    {displaySplitAddress(account.address)}{' '}
                </div>
                <Checkbox
                    className="connect-accounts-request-accounts__account-item__check-box"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                />
            </div>
            <div className="connect-accounts-request-accounts__account-item__secondary">{identityName}</div>
            <div className="connect-accounts-request-accounts__account-item__secondary mono">{displayAsCcd(totalBalance)}</div>
        </div>
    );
}

export default function ConnectionRequest({ onAllow, onReject }: Props) {
    const { state } = useLocation();
    const { t } = useTranslation('connectionRequest');
    const { onClose, withClose } = useContext(fullscreenPromptContext);
    const selectedAccount = useAtomValue(selectedAccountAtom);
    const [connectedSitesLoading, setConnectedSites] = useAtom(storedConnectedSitesAtom);
    const connectedSites = connectedSitesLoading.value;
    const passcode = useAtomValue(sessionPasscodeAtom);
    const [connectButtonDisabled, setConnectButtonDisabled] = useState<boolean>(false);
    const accountst = useAtomValue(credentialsAtom);
    const accounts = accountst.concat(accountst).concat(accountst);

    useEffect(() => onClose(onReject), [onClose, onReject]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { url } = (state as any).payload;
    const urlDisplay = displayUrl(url);

    return (
        <ExternalRequestLayout>
            <div className="h-full flex-column align-center">
                <header className="m-v-18 text-center">
                    <h3>{urlDisplay} wants to be added to your allowlist. Do you want to proceed?</h3>
                </header>
                <div className='connect-accounts-request'>
                    <h3>Allowlisting a service</h3>
                    Allowlisting a service means that it can request identity proofs and signatures from selected accounts.
                </div>
                <div className='connect-accounts-request-accounts'>
                    <AccountInfoListenerContextProvider>
                        {accounts.map((account) => {
                            return <AccountListItem account={account} checked={false} selected={false} identityName='SomeName'/>
                        })}
                    </AccountInfoListenerContextProvider>
                </div>
                <div className="flex p-b-10  m-t-auto">
                    <Button width="narrow" className="m-r-10" onClick={withClose(onReject)}>
                        {t('actions.cancel')}
                    </Button>
                    <Button
                        width="narrow"
                        disabled={connectButtonDisabled}
                        onClick={() => {
                            setConnectButtonDisabled(true);
                            // connectAccount(selectedAccount, new URL(url).origin).then(withClose(onAllow));
                        }}
                    >
                        {t('actions.connect')}
                    </Button>
                </div>
            </div>
        </ExternalRequestLayout>
    );
}

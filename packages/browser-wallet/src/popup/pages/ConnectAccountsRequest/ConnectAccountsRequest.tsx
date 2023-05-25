import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import { credentialsAtom } from '@popup/store/account';
import { useAtomValue } from 'jotai';
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
    identityName: string;
};

function AccountListItem({ account, identityName }: ItemProps) {
    const accountInfo = useAccountInfo(account);
    const totalBalance = useMemo(() => accountInfo?.accountAmount || 0n, [accountInfo?.accountAmount]);

    return (
        <div className="connect-accounts-request-accounts__account-item">
            <div className="connect-accounts-request-accounts__account-item__primary">
                <div className="flex align-center">{displaySplitAddress(account.address)} </div>
                <Checkbox
                    className="connect-accounts-request-accounts__account-item__check-box"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                />
            </div>
            <div className="connect-accounts-request-accounts__account-item__secondary">{identityName}</div>
            <div className="connect-accounts-request-accounts__account-item__secondary mono">
                {displayAsCcd(totalBalance)}
            </div>
        </div>
    );
}

export default function ConnectionRequest({ onAllow, onReject }: Props) {
    const { state } = useLocation();
    const { t } = useTranslation('connectionRequest');
    const { onClose, withClose } = useContext(fullscreenPromptContext);
    const [connectButtonDisabled, setConnectButtonDisabled] = useState<boolean>(false);
    const accounts = useAtomValue(credentialsAtom);

    useEffect(() => onClose(onReject), [onClose, onReject]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { url } = (state as any).payload;
    const urlDisplay = displayUrl(url);

    return (
        <ExternalRequestLayout>
            <div className="h-full flex-column align-center">
                <header className="text-center">
                    <h3 className="m-v-5">{urlDisplay} wants to be added to your allowlist. Do you want to proceed?</h3>
                </header>
                <div className="connect-accounts-request">
                    <h3>Allowlisting a service</h3>
                    Allowlisting a service means that it can request identity proofs and signatures from selected
                    accounts.
                </div>
                <div className="connect-accounts-request-accounts">
                    <AccountInfoListenerContextProvider>
                        {accounts.map((account) => {
                            return <AccountListItem key={account.address} account={account} identityName="SomeName" />;
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
                        onClick={withClose(() => {
                            setConnectButtonDisabled(true);
                            onAllow();
                        })}
                    >
                        {t('actions.connect')}
                    </Button>
                </div>
            </div>
        </ExternalRequestLayout>
    );
}

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '@popup/shared/Button/Button';
import { selectedAccountAtom, storedAllowlistAtom } from '@popup/store/account';
import { useAtom, useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { EventType } from '@concordium/browser-wallet-api-helpers';
import AllowlistEntryView, { AllowlistMode } from './AllowlistEntryView';
import { handleAllowlistEntryUpdate } from './util';

function LoadingAllowlistEditor() {
    return <div className="allow-list-editor" />;
}

export default function AllowlistEditor() {
    const nav = useNavigate();
    const { t } = useTranslation('allowlist', { keyPrefix: 'view' });
    const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
    const { serviceName } = useParams<{ serviceName: string }>();
    const [allowListLoading, setAllowList] = useAtom(storedAllowlistAtom);
    const selectedAccount = useAtomValue(selectedAccountAtom);

    if (!serviceName) {
        throw new Error('Invalid URL - the service name should be part of the URL.');
    }

    const decodedServiceName = decodeURIComponent(serviceName);

    useEffect(() => {
        if (!allowListLoading.loading) {
            setSelectedAccounts(allowListLoading.value[serviceName]);
        }
    }, [allowListLoading]);

    async function removeService(serviceNameToRemove: string, allowlist: Record<string, string[]>) {
        const updatedAllowlist = { ...allowlist };
        const disconnectedAccounts = [...updatedAllowlist[serviceNameToRemove]];
        delete updatedAllowlist[serviceNameToRemove];
        await setAllowList(updatedAllowlist);

        for (const account of disconnectedAccounts) {
            popupMessageHandler.broadcastToUrl(EventType.AccountDisconnected, serviceNameToRemove, account);
        }
    }

    if (allowListLoading.loading) {
        return <LoadingAllowlistEditor />;
    }

    return (
        <div className="allow-list-editor">
            <AllowlistEntryView
                selectedAccounts={selectedAccounts}
                setSelectedAccounts={setSelectedAccounts}
                mode={AllowlistMode.Modify}
            />
            <div className="flex p-b-10 m-t-auto">
                <Button
                    className="m-r-10"
                    width="narrow"
                    onClick={() =>
                        handleAllowlistEntryUpdate(
                            decodedServiceName,
                            allowListLoading.value,
                            selectedAccounts,
                            setAllowList,
                            selectedAccount
                        ).then(() => nav(-1))
                    }
                >
                    {t('update')}
                </Button>
                <Button
                    width="narrow"
                    onClick={() => removeService(decodedServiceName, allowListLoading.value).then(() => nav(-1))}
                >
                    {t('remove')}
                </Button>
            </div>
        </div>
    );
}

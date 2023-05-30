import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '@popup/shared/Button/Button';
import { storedAllowListAtom } from '@popup/store/account';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import AllowlistEntryView, { AllowlistMode } from './AllowlistEntryView';
import { updateAllowList } from './util';

function LoadingAllowlistEditor() {
    return <div className="allow-list-editor" />;
}

export default function AllowlistEditor() {
    const nav = useNavigate();
    const { t } = useTranslation('allowlist', { keyPrefix: 'view' });
    const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
    const { serviceName } = useParams<{ serviceName: string }>();
    const [allowListLoading, setAllowList] = useAtom(storedAllowListAtom);

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
        delete updatedAllowlist[serviceNameToRemove];
        await setAllowList(updatedAllowlist);
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
            <div className="flex ">
                <Button
                    className="margin-center m-b-5"
                    width="narrow"
                    onClick={() =>
                        updateAllowList(
                            decodedServiceName,
                            allowListLoading.value,
                            selectedAccounts,
                            setAllowList
                        ).then(() => nav(-1))
                    }
                >
                    {t('update')}
                </Button>
                <Button
                    className="margin-center m-b-5"
                    width="narrow"
                    onClick={() => removeService(decodedServiceName, allowListLoading.value).then(() => nav(-1))}
                >
                    {t('remove')}
                </Button>
            </div>
        </div>
    );
}

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '@popup/shared/Button/Button';
import { storedAllowListAtom } from '@popup/store/account';
import { useAtom } from 'jotai';
import { absoluteRoutes } from '@popup/constants/routes';
import { useTranslation } from 'react-i18next';
import AllowlistEditor from './AllowlistEditor';
import { updateAllowList } from './util';

export default function AllowListView() {
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
        return <div className="allow-list-edit-page" />;
    }

    return (
        <div className="allow-list-edit-page">
            <AllowlistEditor selectedAccounts={selectedAccounts} setSelectedAccounts={setSelectedAccounts} />
            <Button
                className="margin-center m-b-5"
                width="wide"
                onClick={() =>
                    updateAllowList(decodedServiceName, allowListLoading.value, selectedAccounts, setAllowList).then(
                        () => nav(absoluteRoutes.home.settings.allowList.path)
                    )
                }
            >
                {t('update')}
            </Button>
            <Button
                className="margin-center m-b-5"
                width="wide"
                onClick={() =>
                    removeService(decodedServiceName, allowListLoading.value).then(() =>
                        nav(absoluteRoutes.home.settings.allowList.path)
                    )
                }
            >
                {t('remove')}
            </Button>
        </div>
    );
}

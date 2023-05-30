import React from 'react';
import SidedRow from '@popup/shared/SidedRow/SidedRow';
import { storedAllowListAtom } from '@popup/store/account';
import { useAtomValue } from 'jotai';
import LinkIcon from '@assets/svg/link.svg';
import { displayUrl } from '@popup/shared/utils/string-helpers';
import Button from '@popup/shared/Button';
import { Route, Routes, generatePath, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { allowlistRoutes } from './routes';
import AllowListView from './AllowListView';

function LoadingAllowlistPage() {
    return <div className="allowlist-settings-page" />;
}

function EmptyAllowlistPage() {
    const { t } = useTranslation('allowlist');
    return <div className="empty-allowlist-settings-page">{t('empty')}</div>;
}

function Allowlist() {
    const nav = useNavigate();
    const allowlistWithLoading = useAtomValue(storedAllowListAtom);
    const allowlist = allowlistWithLoading.value;

    if (allowlistWithLoading.loading) {
        return <LoadingAllowlistPage />;
    }
    if (Object.entries(allowlist).length === 0) {
        return <EmptyAllowlistPage />;
    }

    return (
        <div className="allowlist-settings-page">
            {Object.keys(allowlist).map((serviceName) => {
                const path = generatePath(allowlistRoutes.edit, { serviceName: encodeURIComponent(serviceName) });
                return (
                    <div className="allowlist-settings-page__list-item" key={serviceName}>
                        <SidedRow
                            left={displayUrl(serviceName)}
                            right={
                                <Button clear onClick={() => nav(path)}>
                                    <LinkIcon className="allowlist-settings-page__link-icon" />
                                </Button>
                            }
                        />
                    </div>
                );
            })}
        </div>
    );
}

export default function AllowListRoutes() {
    return (
        <Routes>
            <Route index element={<Allowlist />} />
            <Route path={`${allowlistRoutes.edit}`} element={<AllowListView />} />
        </Routes>
    );
}

import React from 'react';
import SidedRow from '@popup/shared/SidedRow/SidedRow';
import { storedAllowlistAtom } from '@popup/store/account';
import { useAtomValue } from 'jotai';
import ForwardArrowIcon from '@assets/svg/arrow-forward.svg';
import { displayUrl } from '@popup/shared/utils/string-helpers';
import { Link, Route, Routes, generatePath } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { allowlistRoutes } from './routes';
import AllowlistEditor from './AllowlistEditor';

function LoadingAllowlistPage() {
    return <div className="allowlist-page" />;
}

function EmptyAllowlistPage() {
    const { t } = useTranslation('allowlist');
    return <div className="allowlist-empty">{t('empty')}</div>;
}

function Allowlist() {
    const allowlistWithLoading = useAtomValue(storedAllowlistAtom);
    const allowlist = allowlistWithLoading.value;

    if (allowlistWithLoading.loading) {
        return <LoadingAllowlistPage />;
    }
    if (Object.entries(allowlist).length === 0) {
        return <EmptyAllowlistPage />;
    }

    return (
        <div className="allowlist-page">
            {Object.keys(allowlist).map((serviceName) => {
                const path = generatePath(allowlistRoutes.edit, { serviceName: encodeURIComponent(serviceName) });
                return (
                    <Link className="allowlist-page__link" to={path}>
                        <div className="allowlist-page__list-item" key={serviceName}>
                            <SidedRow
                                left={displayUrl(serviceName)}
                                right={<ForwardArrowIcon className="allowlist-page__link-icon" />}
                            />
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}

export default function AllowListRoutes() {
    return (
        <Routes>
            <Route index element={<Allowlist />} />
            <Route path={`${allowlistRoutes.edit}`} element={<AllowlistEditor />} />
        </Routes>
    );
}

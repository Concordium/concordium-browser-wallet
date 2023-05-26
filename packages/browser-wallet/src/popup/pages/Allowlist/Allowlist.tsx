import React from 'react';
import SidedRow from '@popup/shared/SidedRow/SidedRow';
import { storedAllowListAtom } from '@popup/store/account';
import { useAtomValue } from 'jotai';
import LinkIcon from '@assets/svg/link.svg';
import { displayUrl } from '@popup/shared/utils/string-helpers';

function EmptyAllowlistPage() {
    return <div className="allowlist-settings-page" />;
}

export default function Allowlist() {
    const allowlistWithLoading = useAtomValue(storedAllowListAtom);
    const allowlist = allowlistWithLoading.value;

    if (allowlistWithLoading.loading) {
        return <EmptyAllowlistPage />;
    }

    return (
        <div className="allowlist-settings-page">
            {Object.keys(allowlist).map((serviceName) => (
                <div className="allowlist-settings-page__list-item" key={serviceName}>
                    <SidedRow
                        left={displayUrl(serviceName)}
                        right={<LinkIcon className="allowlist-settings-page__link-icon" />}
                    />
                </div>
            ))}
        </div>
    );
}

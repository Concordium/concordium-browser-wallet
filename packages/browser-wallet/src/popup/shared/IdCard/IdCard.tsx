import clsx from 'clsx';
import React from 'react';

import VerfifiedIcon from '@assets/svg/verified-stamp.svg';
import RejectedIcon from '@assets/svg/rejected-stamp.svg';

type Props = {
    name: string;
    status: 'pending' | 'verified' | 'rejected';
    // eslint-disable-next-line react/no-unused-prop-types
    onNameChange(name: string): void;
    provider: JSX.Element;
};

export default function IdCard({ name, provider, status }: Props) {
    return (
        <div
            className={clsx(
                'id-card',
                status === 'pending' && 'id-card--pending',
                status === 'rejected' && 'id-card--rejected'
            )}
        >
            <header className="id-card__header">Concordium identity</header>
            <div className="id-card__name">{name}</div>
            <div className="id-card__status">
                {status} {provider}
            </div>
            <div className="id-card__stamp">
                {status === 'verified' && <VerfifiedIcon />}
                {status === 'rejected' && <RejectedIcon />}
            </div>
        </div>
    );
}

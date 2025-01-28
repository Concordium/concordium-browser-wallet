import clsx from 'clsx';
import React from 'react';
import { ClassName } from 'wallet-common-helpers';

export function LoaderInline({ className }: ClassName) {
    return <span className={clsx('loader-x', className)} />;
}

export default function Loader() {
    return (
        <div className="loader-x-container">
            <LoaderInline />
        </div>
    );
}

import clsx from 'clsx';
import React from 'react';
import { ClassName } from 'wallet-common-helpers';

type Props = ClassName & { path: string; children?: string };

export default function ExternalLink({ path, children = path, className }: Props) {
    return (
        <a className={clsx('external-link', className)} href={`${path}`} target="_blank" rel="noreferrer">
            {children}
        </a>
    );
}

import clsx from 'clsx';
import React from 'react';
import { ClassName } from 'wallet-common-helpers';

type Props = ClassName & { path: string; children: string };

export default function ExternalLink({ path, children, className }: Props) {
    return (
        <a className={clsx(className)} href={`${path}`} target="_blank" rel="noreferrer">
            {children}
        </a>
    );
}

/* eslint-disable react/destructuring-assignment */
import React from 'react';
import clsx from 'clsx';
import { chunkString } from '../utils/basicHelpers';

export enum AddressDisplayFormat {
    Ledger,
    DoubleLine,
}

interface DisplayFormatConfig {
    baseClassName?: string;
    baseLineClassName?: string;
    lineLength: number;
}

const formatMap: {
    [k in AddressDisplayFormat]: DisplayFormatConfig;
} = {
    [AddressDisplayFormat.Ledger]: {
        baseClassName: 'flex flexWrap justifyCenter',
        baseLineClassName: 'mH5',
        lineLength: 10,
    },
    [AddressDisplayFormat.DoubleLine]: {
        baseClassName: 'textCenter',
        lineLength: 25,
    },
};

interface Props {
    address: string;
    lineClassName?: string;
    className?: string;
    format?: AddressDisplayFormat;
}

export default function DisplayAddress({
    address,
    lineClassName,
    className,
    format = AddressDisplayFormat.Ledger,
}: Props) {
    const { baseClassName, baseLineClassName, lineLength } = formatMap[format];
    return (
        <div className={clsx(baseClassName, 'mono', className)}>
            {chunkString(address, lineLength).map((text) => (
                <div className={clsx(baseLineClassName, lineClassName)} key={text}>
                    {text}
                </div>
            ))}
        </div>
    );
}

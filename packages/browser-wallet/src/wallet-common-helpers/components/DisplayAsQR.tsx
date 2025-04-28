import React, { useLayoutEffect, useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface Props {
    value: string;
    className: string;
    bgColor?: string;
}

/**
 * Displays the given value as a QR code. The size of the QR is controlled by className.
 */
export default function QR({ value, className, bgColor }: Props) {
    const [size, setSize] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const [obs] = useState(
        new ResizeObserver((entries) => {
            setSize(ref.current !== null ? Math.min(entries[0].contentRect.height, entries[0].contentRect.width) : 0);
        })
    );

    useLayoutEffect(() => {
        if (ref.current) {
            obs.observe(ref.current);
            return () => obs.disconnect();
        }
        return () => {};
    }, [ref.current]);

    return (
        <div className={className} ref={ref}>
            <QRCodeCanvas size={size} value={value} bgColor={bgColor} />
        </div>
    );
}

import React, { PropsWithChildren, useRef, useState } from 'react';
import {
    useFloating,
    arrow,
    FloatingArrow,
    useClick,
    useInteractions,
    autoUpdate,
    flip,
    size,
    offset,
} from '@floating-ui/react';

import InfoIcon from '@assets/svgX/info.svg';

type Props = PropsWithChildren<unknown>;

export default function DisplayStatementsTooltip({ children }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const arrowRef = useRef(null);

    const { refs, floatingStyles, context } = useFloating({
        open: isOpen,
        onOpenChange: setIsOpen,
        middleware: [arrow({ element: arrowRef, padding: 30 }), flip(), size({ padding: 5 }), offset(5)],
        placement: 'top-end',
        whileElementsMounted: autoUpdate,
    });
    const click = useClick(context);
    const { getReferenceProps, getFloatingProps } = useInteractions([click]);

    return (
        <>
            <button
                className="display-statements-tooltip__trigger"
                type="button"
                ref={refs.setReference}
                {...getReferenceProps()}
            >
                <InfoIcon />
            </button>
            {isOpen && (
                <div
                    className="display-statements-tooltip"
                    ref={refs.setFloating}
                    style={floatingStyles}
                    {...getFloatingProps()}
                >
                    <FloatingArrow ref={arrowRef} context={context} fill="white" />
                    {children}
                </div>
            )}
        </>
    );
}

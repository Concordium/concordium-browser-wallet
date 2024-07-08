import { PropsWithChildren, ReactPortal, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';

interface PortalProps {
    /**
     * Override the root of the portal. Defaults to \<body /\>
     */
    root?: HTMLElement | null;
    className?: string;
}

/**
 * @description
 * Open children in react portal. Good for spawning elements elsewhere in the DOM tree (modals, popups, etc.)
 *
 * @example
 * <Portal>
 *   Renders another place in the DOM
 * </Portal>
 */
export default function Portal({ root: r, children, className }: PropsWithChildren<PortalProps>): ReactPortal {
    const { current: el } = useRef(document.createElement('div'));
    const root = useMemo(() => r ?? document.getElementsByTagName('body')[0], [r]);

    useEffect(() => {
        if (className) {
            el.classList.value = className;
        }
    }, [el, className]);

    useLayoutEffect(() => {
        root.appendChild(el);

        return () => {
            root.removeChild(el);
        };
    }, [root, el]);

    return ReactDOM.createPortal(children, el);
}

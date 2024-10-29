import React, { PropsWithChildren, useCallback, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import { Portal, noOp } from 'wallet-common-helpers';
import Back from '@assets/svgX/arrow-left.svg';
import { Connection, Fullscreen } from '@popup/popupX/page-layouts/MainLayout/Header/components';
import Button from '../Button';

type HeaderProps = {
    isScrolling: boolean;
    onBack(): void;
};

function Header({ isScrolling, onBack }: HeaderProps) {
    return (
        <div className={clsx('main-header', isScrolling && 'scroll-border')}>
            <div className="main-header__top">
                <Fullscreen />
                <Connection hideConnection={false} />
            </div>
            <div className="main-header__bottom">
                <Button.Icon className="fullscreen-notice__back" icon={<Back />} onClick={() => onBack()} />
            </div>
        </div>
    );
}

const htmlElement = document.getElementsByTagName('html')[0]!;
const bodyElement = document.getElementsByTagName('body')[0]!;

export type FullscreenNoticeProps = {
    /** Control whether notice is shown or not */
    open: boolean;
    /** Invoked when the notice is closed */
    onClose(): void;
};

/**
 * @description
 * Opens content in a modal overlay on top of the current wallet window.
 *
 * @example
 * <FullscreenNotice open={isOpen} onClose={() => setIsOpen(false)}>
 *   <Page>
 *     <Page.Top heading="Notice title"/>
 *     This is the body
 *     <Page.Footer>
 *       <Button.Main>Some action</Button.Main>
 *     </Page.Footer>
 *   </Page>
 *   This content is shown in a modal!
 * </FullscreenNotice>
 */
export default function FullscreenNotice({
    open,
    onClose,
    children,
}: PropsWithChildren<FullscreenNoticeProps>): JSX.Element | null {
    const [scroll, setScroll] = React.useState(0);
    const isScrolling = useMemo(() => scroll > 0, [!!scroll]);
    const close = useCallback(() => {
        onClose();
    }, [onClose]);

    useEffect(() => {
        if (open) {
            htmlElement.classList.add('modal-open');

            // Prevent modal from stretching window height
            htmlElement.style.height = bodyElement.style.height;

            return () => {
                htmlElement.classList.remove('modal-open');
                // Reset to initial value
                htmlElement.style.height = '100%';
            };
        }
        return noOp;
    }, [open]);

    if (!open) {
        return null;
    }

    return (
        <Portal className="fullscreen-notice bg">
            <Header isScrolling={isScrolling} onBack={close} />
            <div
                className="fullscreen-notice__content"
                onScroll={(e) => {
                    setScroll(e.currentTarget.scrollTop);
                }}
            >
                {children}
            </div>
        </Portal>
    );
}

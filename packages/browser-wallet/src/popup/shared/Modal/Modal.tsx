import React, {
    cloneElement,
    MouseEventHandler,
    PropsWithChildren,
    ReactElement,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { DetectClickOutside, noOp, Portal } from 'wallet-common-helpers';
import clsx from 'clsx';

import { defaultTransition } from '@shared/constants/transition';
import CloseButton from '../CloseButton';

const modalTransitionVariants: Variants = {
    open: { opacity: 1, y: 0 },
    closed: { opacity: 0, y: '5rem' },
};

const htmlElement = document.getElementsByTagName('html')[0];

type WithOnClick = {
    onClick?: MouseEventHandler;
};

type OpenState = {
    isOpen: boolean;
    isExiting: boolean;
};

export type ModalProps<T extends WithOnClick = WithOnClick> = {
    /**
     * Supply element that acts as a trigger for modal to open. Must have "onClick" as prop.
     */
    trigger?: ReactElement<T>;
    /**
     * Disable close functionality within the modal. Good for user actions that must be taken.
     */
    disableClose?: boolean;
    /**
     * Control whether modal is open or not.
     */
    open: boolean;
    /**
     * Renders with error styling
     */
    error?: boolean;
    onOpen?(): void;
    onClose?(): void;
    bottom?: boolean;
    middle?: boolean;
    stableScrollbarGutter?: boolean;
    /**
     * Used to overwrite styling for the modal content box
     */
    className?: string;
};

/**
 * @description
 * Opens content in a modal overlay on top of the current wallet window.
 *
 * @example
 * <Modal trigger={<button type="button">Click me</button>} open={isOpen} onOpen={() => setIsOpen(true)} onClose={() => setIsOpen(false)}>
 *   This content is shown in a modal!
 * </Modal>
 */
export default function Modal<T extends WithOnClick = WithOnClick>({
    trigger,
    className,
    disableClose = false,
    open: isOpenOverride,
    error = false,
    onOpen = noOp,
    onClose = noOp,
    bottom = false,
    middle = false,
    stableScrollbarGutter = false,
    children,
}: PropsWithChildren<ModalProps<T>>): JSX.Element | null {
    const [{ isOpen, isExiting }, setOpenState] = useState<OpenState>({ isOpen: false, isExiting: false });

    const open = useCallback(() => {
        setOpenState(() => ({ isOpen: true, isExiting: false }));
        onOpen();
    }, [onOpen]);

    const close = useCallback(
        (ignoreDisable = false) => {
            if (!disableClose || ignoreDisable) {
                setOpenState((s) => ({ ...s, isExiting: true }));
            }
        },
        [disableClose]
    );

    const handleExitComplete = useCallback(() => {
        setOpenState(() => ({ isOpen: false, isExiting: false }));
        onClose();
    }, [onClose]);

    useEffect(() => {
        if (isExiting) {
            return;
        }
        if (isOpenOverride && !isOpen) {
            open();
        } else if (!isOpenOverride && isOpen) {
            close(true);
        }
    }, [isOpenOverride]);

    useEffect(() => {
        if (isOpen) {
            htmlElement?.classList.add('modal-open');
            return () => htmlElement?.classList.remove('modal-open');
        }
        return noOp;
    }, [isOpen]);

    const onTriggerClick: MouseEventHandler = useCallback(
        (e) => {
            open();

            if (trigger?.props.onClick !== undefined) {
                trigger.props.onClick(e);
            }
        },
        [trigger, open]
    );

    const triggerWithOpen = useMemo(() => {
        if (!trigger) {
            return undefined;
        }

        return cloneElement(trigger, {
            ...trigger.props,
            onClick: onTriggerClick,
        });
    }, [trigger, onTriggerClick]);

    return (
        <>
            {triggerWithOpen}
            {isOpen && (
                <Portal
                    className={clsx(
                        'modal',
                        bottom && 'modal--align-bottom',
                        middle && 'modal--align-middle',
                        stableScrollbarGutter && 'modal--stable-scrollbar-gutter'
                    )}
                >
                    <AnimatePresence onExitComplete={handleExitComplete}>
                        {!isExiting && (
                            <DetectClickOutside
                                as={motion.div}
                                className={clsx('modal__content', error && 'modal__content--error', className)}
                                initial="closed"
                                animate="open"
                                exit="closed"
                                variants={modalTransitionVariants}
                                transition={defaultTransition}
                                onClickOutside={close}
                            >
                                {!disableClose && <CloseButton className="modal__close" onClick={() => close()} />}
                                {children}
                            </DetectClickOutside>
                        )}
                    </AnimatePresence>
                </Portal>
            )}
        </>
    );
}

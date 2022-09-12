import React, { createContext, useRef, useCallback, useMemo, useState } from 'react';
import { Outlet, useNavigate, To } from 'react-router-dom';
import { noOp } from 'wallet-common-helpers';

import { isSpawnedWindow } from '@popup/shared/window-helpers';

type OnCloseHandler = () => void;
type Unsubscribe = () => void;

type OnClose = (handler: OnCloseHandler) => Unsubscribe;
type WithClose = <A extends unknown[], F extends (...args: A) => void>(action: F) => (...args: A) => void;

type FullscreenPromptContext = {
    onClose: OnClose;
    /**
     * Generate an action, that also closes the prompt.
     */
    withClose: WithClose;
    /**
     *
     */
    setReturnLocation: (location: To) => void;
};

const defaultContext: FullscreenPromptContext = {
    onClose: () => noOp,
    withClose: () => noOp,
    setReturnLocation: noOp,
};

export const fullscreenPromptContext = createContext<FullscreenPromptContext>(defaultContext);

export default function FullscreenPromptLayout() {
    const nav = useNavigate();
    const [returnLocation, setReturnLocation] = useState<To>();

    const closeHandler = useRef<OnCloseHandler>();
    const close = useCallback(() => {
        closeHandler?.current?.();

        if (isSpawnedWindow) {
            window.close();
        } else if (returnLocation) {
            nav(returnLocation);
        } else {
            // Go back
            nav(-1);
        }
    }, [returnLocation]);

    const withClose: WithClose = useCallback(
        (action) =>
            (...args) => {
                action(...args);
                close();
            },
        [close]
    );

    const onClose: OnClose = useCallback((handler) => {
        closeHandler.current = handler;

        return () => {
            closeHandler.current = undefined;
        };
    }, []);

    const contextValue: FullscreenPromptContext = useMemo(
        () => ({ onClose, withClose, setReturnLocation }),
        [onClose, withClose]
    );

    return (
        <fullscreenPromptContext.Provider value={contextValue}>
            <Outlet />
        </fullscreenPromptContext.Provider>
    );
}

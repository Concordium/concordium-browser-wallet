import React, { createContext, useRef, useCallback, useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import { noOp } from '@shared/utils/basic-helpers';
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
};

const defaultContext: FullscreenPromptContext = {
    onClose: () => noOp,
    withClose: () => noOp,
};

export const fullscreenPromptContext = createContext<FullscreenPromptContext>(defaultContext);

function useNavigateBack() {
    const nav = useNavigate();

    return () => nav(-1);
}

export default function FullscreenPromptLayout() {
    const goBack = useNavigateBack();

    const closeHandler = useRef<OnCloseHandler>();
    const close = useCallback(() => {
        closeHandler?.current?.();

        if (isSpawnedWindow) {
            window.close();
        } else {
            goBack();
        }
    }, []);

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

    const contextValue: FullscreenPromptContext = useMemo(() => ({ onClose, withClose }), [onClose, withClose]);

    return (
        <fullscreenPromptContext.Provider value={contextValue}>
            <div className="fullscreen-prompt-layout">
                <button className="fullscreen-prompt-layout__close" type="button" onClick={() => close()}>
                    X
                </button>
                <main>
                    <Outlet />
                </main>
            </div>
        </fullscreenPromptContext.Provider>
    );
}

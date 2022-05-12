import React, { createContext, useRef, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import { noOp } from '@shared/utils/basicHelpers';

type OnCloseHandler = () => void;
type Unsubscribe = () => void;

type FullscreenPromptContext = {
    onClose(handler: OnCloseHandler): Unsubscribe;
    close(): void;
};

const defaultContext: FullscreenPromptContext = {
    onClose: () => noOp,
    close: noOp,
};

export const fullscreenPromptContext = createContext<FullscreenPromptContext>(defaultContext);

function useNavigateBack() {
    const nav = useNavigate();

    return () => nav(-1);
}

export default function FullscreenPromptLayout() {
    const goBack = useNavigateBack();

    const closeHandler = useRef<OnCloseHandler>();
    const close = () => {
        closeHandler?.current?.();
        goBack();
    };

    const onClose = useCallback((handler: OnCloseHandler) => {
        closeHandler.current = handler;

        return () => {
            closeHandler.current = undefined;
        };
    }, []);

    return (
        // eslint-disable-next-line react/jsx-no-constructed-context-values
        <fullscreenPromptContext.Provider value={{ onClose, close }}>
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

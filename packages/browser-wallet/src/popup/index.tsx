import React from 'react';
import { createRoot } from 'react-dom/client';
import { createMessageTypeFilter, InternalMessageType } from '@concordium/browser-wallet-message-hub';

import Root from './shell/Root';

import './index.scss';
import { popupMessageHandler } from './shared/message-handler';

const container = document.getElementById('root');

// To let bg thread know we're alive and ready.
popupMessageHandler.handleMessage(
    createMessageTypeFilter(InternalMessageType.TestPopupOpen),
    (_msg, _sender, respond) => respond(true)
);

if (!container) {
    throw new Error('Expected container DOM node to be defined');
}

const root = createRoot(container);
root.render(<Root />);

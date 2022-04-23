import React from 'react';
import { createRoot } from 'react-dom/client';
import Root from './shell/Root';

import './index.scss';

const container = document.getElementById('root');

if (!container) {
    throw new Error('Expected container DOM node to be defined');
}

const root = createRoot(container);
root.render(<Root />);

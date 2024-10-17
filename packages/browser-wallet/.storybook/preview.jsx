import React, { useEffect } from 'react';

import '../src/popup/index.scss';
import '../src/popup/shell/i18n';

document.getElementsByTagName('html').item(0)?.classList.add('ui-scale-large');

/**
 * Switches theme to dark mode when the background in storybook is set to dark.
 */
const themeDecorator = (Story, { globals, parameters }) => {
    const darkValue = parameters.backgrounds.values.find((bg) => bg.name === 'dark')?.value;
    const bgValue = globals.backgrounds?.value;
    const isDark = bgValue === darkValue || (parameters.backgrounds.default === 'dark' && bgValue === undefined);

    useEffect(() => {
        const cl = document.getElementsByTagName('body').item(0)?.classList;

        if (!cl) {
            throw new Error('no body element');
        }

        if (isDark) {
            cl.add('dark');
        } else {
            cl.remove('dark');
        }
    }, [isDark]);

    return <Story />;
};

export const parameters = {
    controls: {
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/,
        },
    },
};

export const decorators = [themeDecorator];
export const tags = ['autodocs'];

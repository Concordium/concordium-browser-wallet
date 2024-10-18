import React, { useEffect } from 'react';

import '../src/popup/index.scss';
import '../src/popup/shell/i18n';

// Workaround for bigint serialization error: https://github.com/storybookjs/storybook/issues/22452
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line no-extend-native, func-names
BigInt.prototype.toJSON = function () {
    return this.toString();
};

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

/**
 * Adds custom styling to the HTML surrounding individual stories.
 */
const customStyleDecorator = (Story) => {
    return (
        <div style={{ padding: '0.5rem' }}>
            <Story />
        </div>
    );
};

export const parameters = {
    viewport: {
        viewports: {
            Small: {
                name: 'Small',
                styles: {
                    width: '312px',
                    height: '528px',
                },
            },
            Normal: {
                name: 'Normal',
                styles: {
                    width: '375px',
                    height: '600px',
                },
            },
        },
        // Optionally, you can set default viewports
        defaultViewport: 'Normal',
    },
    controls: {
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/,
        },
    },
    backgrounds: { default: 'dark' },
};

export const decorators = [themeDecorator, customStyleDecorator];
export const tags = ['autodocs'];

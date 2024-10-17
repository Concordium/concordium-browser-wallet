/* eslint-disable react/function-component-definition */
import React from 'react';
import { Meta, StoryObj } from '@storybook/react';

import BackIcon from '@assets/svg/back-arrow.svg';

import IconButton from './IconButton';

export default {
    title: 'Shared/IconButton',
    component: IconButton,
} as Meta<typeof IconButton>;

export const Primary: StoryObj<typeof IconButton> = {
    render: (args) => {
        return (
            <>
                <style>
                    {`
                svg path {
                    fill: var(--color-text, black);
                }
                `}
                </style>
                <IconButton {...args} />
            </>
        );
    },
    args: {
        children: <BackIcon width="16" style={{ padding: '0 3px' }} />,
    },
};

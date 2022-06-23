/* eslint-disable react/function-component-definition, import/no-extraneous-dependencies */
import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import BackIcon from '@assets/svg/back-arrow.svg';
import CloseIcon from '@assets/svg/cross.svg';

import IconButton from './IconButton';

export default {
    title: 'Shared/IconButton',
    component: IconButton,
} as ComponentMeta<typeof IconButton>;

const Template: ComponentStory<typeof IconButton> = (args) => {
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
};

export const Back = Template.bind({});
Back.args = {
    children: <BackIcon width="16" style={{ padding: '0 3px' }} />,
};

export const Close = Template.bind({});
Close.args = {
    children: <CloseIcon width="16" />,
};

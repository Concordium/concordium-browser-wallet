/* eslint-disable react/function-component-definition */
import React from 'react';
import { BrowserRouter, Link as RouterLink } from 'react-router-dom';
import { Meta, StoryObj } from '@storybook/react';
import Button from './Button';

export default {
    title: 'Shared/Button',
    component: Button,
} as Meta<typeof Button>;

type Story = StoryObj<typeof Button>;
const render: Story['render'] = (args) => {
    return (
        <BrowserRouter>
            <Button {...args} />
        </BrowserRouter>
    );
};
export const Primary: StoryObj<typeof Button> = {
    args: {
        children: 'Button text',
    },
    render,
};
export const Link: Story = {
    args: {
        children: 'Button text',
        as: RouterLink,
        to: '/some-route',
    },
    render,
};

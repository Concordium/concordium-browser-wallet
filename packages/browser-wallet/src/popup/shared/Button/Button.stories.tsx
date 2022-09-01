/* eslint-disable react/function-component-definition */
import React from 'react';
import { BrowserRouter, Link as RouterLink } from 'react-router-dom';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import Button from './Button';

export default {
    title: 'Shared/Button',
    component: Button,
} as ComponentMeta<typeof Button>;

const Template: ComponentStory<typeof Button> = (args) => {
    return (
        <BrowserRouter>
            <Button {...args} />
        </BrowserRouter>
    );
};

export const Primary = Template.bind({});
Primary.args = {
    children: 'Button text',
};

export const Narrow = Template.bind({});
Narrow.args = {
    children: 'Button text',
    width: 'medium',
};

export const Wide = Template.bind({});
Wide.args = {
    children: 'Button text',
    width: 'wide',
};

export const Faded = Template.bind({});
Faded.args = {
    children: 'Button text',
    faded: true,
};

export const Danger = Template.bind({});
Danger.args = {
    children: 'Button text',
    danger: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
    children: 'Button text',
    disabled: true,
};

export const Clear = Template.bind({});
Clear.args = {
    children: 'Button text',
    clear: true,
};

export const Link = Template.bind({});
Link.args = {
    children: 'Button text',
    as: RouterLink,
    to: '/some-route',
};

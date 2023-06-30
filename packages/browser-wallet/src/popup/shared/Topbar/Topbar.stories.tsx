/* eslint-disable react/function-component-definition */
import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import Topbar, { ButtonTypes } from './Topbar';

export default {
    title: 'Shared/Topbar',
    component: Topbar,
} as ComponentMeta<typeof Topbar>;

const Template: ComponentStory<typeof Topbar> = (args) => {
    return (
        <MemoryRouter initialEntries={['/']}>
            <div style={{ width: 375, height: 600, backgroundColor: 'yellowgreen' }}>
                <Topbar {...args} />
            </div>
        </MemoryRouter>
    );
};

export const WithBackButton = Template.bind({});
WithBackButton.args = {
    title: 'Page Navigation Title',
};

export const WithoutBackButton = Template.bind({});
WithoutBackButton.args = {
    title: 'Page Navigation Title',
    backButton: { show: false },
};

export const WithMoreMenuButton = Template.bind({});
WithMoreMenuButton.args = {
    title: 'Page Navigation Title',
    backButton: { show: false },
    menuButton: { type: ButtonTypes.More, items: [{ title: 'Revoke', icon: <div>Test</div> }] },
};

export const WithBackAndMoreMenuButton = Template.bind({});
WithBackAndMoreMenuButton.args = {
    title: 'Page Navigation Title',
    menuButton: { type: ButtonTypes.More, items: [{ title: 'Revoke', icon: <div>Test</div> }] },
};

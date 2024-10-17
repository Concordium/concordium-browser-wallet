/* eslint-disable react/function-component-definition */
import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import Topbar, { ButtonTypes } from './Topbar';

export default {
    title: 'Shared/Topbar',
    component: Topbar,
} as Meta<typeof Topbar>;

export const Primary: StoryObj<typeof Topbar> = {
    render: (args) => {
        return (
            <MemoryRouter initialEntries={['/']}>
                <div style={{ width: 375, height: 600, backgroundColor: 'yellowgreen' }}>
                    <Topbar {...args} />
                </div>
            </MemoryRouter>
        );
    },
    args: {
        title: 'Page Navigation Title',
        onBackButtonClick: () => {},
        menuButton: { type: ButtonTypes.More, items: [{ title: 'Revoke', icon: <div>Test</div> }] },
    },
};

/* eslint-disable react/function-component-definition */
import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import RevokeIcon from '@assets/svg/revoke.svg';
import ArchiveIcon from '@assets/svg/archive.svg';
import PopupMenu from './PopupMenu';

export default {
    title: 'Shared/PopupMenu',
    component: PopupMenu,
} as Meta<typeof PopupMenu>;

export const Primary: StoryObj<typeof PopupMenu> = {
    render: (args) => {
        return (
            <MemoryRouter initialEntries={['/']}>
                <div style={{ width: 375, height: 600 }}>
                    <PopupMenu {...args} />
                </div>
            </MemoryRouter>
        );
    },
    args: {
        items: [
            { title: 'Revoke', icon: <RevokeIcon /> },
            { title: 'Archive', icon: <ArchiveIcon /> },
        ],
    },
};

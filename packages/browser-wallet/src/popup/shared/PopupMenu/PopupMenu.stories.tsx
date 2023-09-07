/* eslint-disable react/function-component-definition */
import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import RevokeIcon from '@assets/svg/revoke.svg';
import ArchiveIcon from '@assets/svg/archive.svg';
import PopupMenu from './PopupMenu';

export default {
    title: 'Shared/PopupMenu',
    component: PopupMenu,
} as ComponentMeta<typeof PopupMenu>;

const Template: ComponentStory<typeof PopupMenu> = (args) => {
    return (
        <MemoryRouter initialEntries={['/']}>
            <div style={{ width: 375, height: 600 }}>
                <PopupMenu {...args} />
            </div>
        </MemoryRouter>
    );
};

export const WithSingleItem = Template.bind({});
WithSingleItem.args = {
    items: [{ title: 'Revoke', icon: <RevokeIcon /> }],
};

export const WithTwoItems = Template.bind({});
WithTwoItems.args = {
    items: [
        { title: 'Revoke', icon: <RevokeIcon /> },
        { title: 'Archive', icon: <ArchiveIcon /> },
    ],
};

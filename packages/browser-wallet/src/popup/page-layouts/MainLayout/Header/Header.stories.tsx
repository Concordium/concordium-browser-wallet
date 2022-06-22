/* eslint-disable react/function-component-definition, import/no-extraneous-dependencies, react/destructuring-assignment */
import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import { noOp } from '@shared/utils/basic-helpers';
import Header from './Header';

export default {
    title: 'Page layouts/MainLayout/Header',
    component: Header,
} as ComponentMeta<typeof Header>;

const Template: ComponentStory<typeof Header> = (args) => {
    return (
        <BrowserRouter>
            <style>
                {`
                    body {
                        padding: 0 !important;
                    }
                `}
            </style>
            <div style={{ width: 300 }}>
                <Header {...args} />
            </div>
        </BrowserRouter>
    );
};

export const Primary = Template.bind({});
Primary.args = {
    onTogglePageDropdown: undefined,
};

export const WithDropdownAction = Template.bind({});
WithDropdownAction.args = {
    onTogglePageDropdown: noOp,
};

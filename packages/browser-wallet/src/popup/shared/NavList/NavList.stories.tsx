/* eslint-disable react/function-component-definition, react/destructuring-assignment */
import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import NavList from './NavList';

export default {
    title: 'Shared/NavList',
    component: NavList,
} as Meta<typeof NavList>;

export const Primary: StoryObj<typeof NavList> = {
    render: () => {
        return (
            <div style={{ width: 300 }}>
                <NavList>
                    <div>First</div>
                    <div>Second</div>
                    <div>Third</div>
                    <div>Fourth</div>
                </NavList>
            </div>
        );
    },
};

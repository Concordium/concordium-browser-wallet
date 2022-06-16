/* eslint-disable react/function-component-definition, import/no-extraneous-dependencies, react/destructuring-assignment */
import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import NavList from './NavList';

export default {
    title: 'Shared/NavList',
    component: NavList,
} as ComponentMeta<typeof NavList>;

export const Primary: ComponentStory<typeof NavList> = () => {
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
};

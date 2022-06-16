/* eslint-disable react/function-component-definition, import/no-extraneous-dependencies, react/destructuring-assignment */
import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import Header from './Header';

export default {
    title: 'Page layouts/Main layout/Header',
    component: Header,
} as ComponentMeta<typeof Header>;

export const Primary: ComponentStory<typeof Header> = () => {
    return (
        <div style={{ width: 300 }}>
            <Header />
        </div>
    );
};

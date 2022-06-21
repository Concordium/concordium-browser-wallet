/* eslint-disable react/function-component-definition, import/no-extraneous-dependencies, react/destructuring-assignment */
import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import Header from './Header';

export default {
    title: 'Page layouts/MainLayout/Header',
    component: Header,
} as ComponentMeta<typeof Header>;

export const Primary: ComponentStory<typeof Header> = () => {
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
                <Header />
            </div>
        </BrowserRouter>
    );
};

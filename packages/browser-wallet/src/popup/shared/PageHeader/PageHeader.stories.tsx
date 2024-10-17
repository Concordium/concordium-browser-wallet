/* eslint-disable react/function-component-definition */
import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import PageHeader from './PageHeader';

export default {
    title: 'Shared/PageHeader',
    component: PageHeader,
} as Meta<typeof PageHeader>;

export const Primary: StoryObj<typeof PageHeader> = {
    render: (args) => {
        return (
            <BrowserRouter>
                <div style={{ width: 300 }}>
                    <PageHeader {...args} />
                </div>
            </BrowserRouter>
        );
    },
    args: {
        children: 'Title',
        canGoBack: true,
        steps: 5,
        activeStep: 3,
    },
};

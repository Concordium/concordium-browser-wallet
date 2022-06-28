/* eslint-disable react/function-component-definition */
import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import PageHeader from './PageHeader';

export default {
    title: 'Shared/PageHeader',
    component: PageHeader,
} as ComponentMeta<typeof PageHeader>;

const Template: ComponentStory<typeof PageHeader> = (args) => {
    return (
        <BrowserRouter>
            <div style={{ width: 300 }}>
                <PageHeader {...args} />
            </div>
        </BrowserRouter>
    );
};

export const Primary = Template.bind({});
Primary.args = {
    children: 'Title',
};

export const Back = Template.bind({});
Back.args = {
    children: 'Title',
    canGoBack: true,
};

export const Steps = Template.bind({});
Steps.args = {
    children: 'Title',
    steps: 5,
    activeStep: 0,
};

export const CompletedSteps = Template.bind({});
CompletedSteps.args = {
    children: 'Title',
    canGoBack: true,
    steps: 5,
    activeStep: 3,
};

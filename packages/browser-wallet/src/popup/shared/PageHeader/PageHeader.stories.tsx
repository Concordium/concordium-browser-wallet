/* eslint-disable react/function-component-definition, import/no-extraneous-dependencies */
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
    title: 'Title',
};

export const Back = Template.bind({});
Back.args = {
    title: 'Title',
    canGoBack: true,
};

export const Steps = Template.bind({});
Steps.args = {
    title: 'Title',
    steps: 5,
    activeStep: 0,
};

export const CompletedSteps = Template.bind({});
CompletedSteps.args = {
    title: 'Title',
    canGoBack: true,
    steps: 5,
    activeStep: 3,
};

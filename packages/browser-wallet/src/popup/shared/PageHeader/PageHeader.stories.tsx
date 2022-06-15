/* eslint-disable react/function-component-definition, import/no-extraneous-dependencies */
import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import PageHeader from './PageHeader';

export default {
    title: 'Shared/PageHeader',
    component: PageHeader,
} as ComponentMeta<typeof PageHeader>;

const Template: ComponentStory<typeof PageHeader> = (args) => {
    return (
        <div style={{ width: 300 }}>
            <PageHeader {...args} />
        </div>
    );
};

export const Primary = Template.bind({});
Primary.args = {
    title: 'Title',
};

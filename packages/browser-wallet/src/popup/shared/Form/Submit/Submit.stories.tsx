/* eslint-disable react/function-component-definition, import/no-extraneous-dependencies */
import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import Submit from './Submit';

export default {
    title: 'Shared/Form/Submit',
    component: Submit,
} as ComponentMeta<typeof Submit>;

const Template: ComponentStory<typeof Submit> = (args) => {
    return <Submit {...args} />;
};

export const Primary = Template.bind({});
Primary.args = {
    children: 'Submit',
};

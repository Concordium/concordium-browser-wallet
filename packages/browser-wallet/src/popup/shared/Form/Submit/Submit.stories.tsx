/* eslint-disable react/function-component-definition */
import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import Submit from './Submit';

export default {
    title: 'Shared/Form/Submit',
    component: Submit,
} as Meta<typeof Submit>;

export const Primary: StoryObj<typeof Submit> = {
    render: (args) => {
        return <Submit {...args} />;
    },
};

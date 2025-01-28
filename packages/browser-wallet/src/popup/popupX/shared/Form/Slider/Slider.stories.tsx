/* eslint-disable react/function-component-definition */
import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Slider } from './Slider';

const render: Story['render'] = (args) => {
    const [value, setValue] = useState<number>();

    return <Slider {...args} value={value} onChange={setValue} />;
};

export default {
    title: 'X/Shared/Form/Slider',
    component: Slider,
    render,
    beforeEach: () => {
        const body = document.getElementsByTagName('body').item(0);
        body?.classList.add('popup-x');

        return () => {
            body?.classList.remove('popup-x');
        };
    },
} as Meta<typeof Slider>;

type Story = StoryObj<typeof Slider>;
export const Integer: Story = {
    render,
    args: {
        label: 'Label',
        min: 50,
        max: 75,
    },
};
export const Percent: Story = {
    render,
    args: {
        label: 'Label',
        unit: '%',
        step: 0.01,
        min: 0,
        max: 100,
    },
};
export const Invalid: Story = {
    render,
    args: {
        label: 'Label',
        min: 0,
        max: 100,
        error: 'This is an error',
        isInvalid: true,
    },
};

/* eslint-disable react/function-component-definition */
import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

type Option = { value: number };
type Story = StoryObj<typeof Select<Option>>;

const render: Story['render'] = (args) => {
    const [value, setValue] = useState<Option>();

    return <Select {...args} value={value} onChange={setValue} />;
};

export default {
    title: 'X/Shared/Form/Select',
    component: Select,
    render,
    beforeEach: () => {
        const body = document.getElementsByTagName('body').item(0);
        body?.classList.add('popup-x');

        return () => {
            body?.classList.remove('popup-x');
        };
    },
} as Meta<typeof Select>;

export const Main: Story = {
    args: {
        options: [{ value: 0 }, { value: 1 }, { value: 2 }],
        id: (v) => `${v?.value ?? ''}`,
        renderOption: (v) => `-- ${v.value} --`,
        children: (v) => (v !== undefined ? <em>{v.value}</em> : 'select an option'),
    },
};

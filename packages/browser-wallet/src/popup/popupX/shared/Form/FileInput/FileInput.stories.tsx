/* eslint-disable react/function-component-definition */
import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { FileInput, FileInputValue } from './FileInput';

const render: Story['render'] = (args) => {
    const [value, setValue] = useState<FileInputValue>(null);

    return <FileInput {...args} value={value} onChange={setValue} multiple />;
};

export default {
    title: 'X/Shared/Form/FileInput',
    component: FileInput,
    render,
    beforeEach: () => {
        const body = document.getElementsByTagName('body').item(0);
        body?.classList.add('popup-x');

        return () => {
            body?.classList.remove('popup-x');
        };
    },
} as Meta<typeof FileInput>;

type Story = StoryObj<typeof FileInput>;
export const Main: Story = {
    args: {
        buttonTitle: 'This is the button title',
    },
};

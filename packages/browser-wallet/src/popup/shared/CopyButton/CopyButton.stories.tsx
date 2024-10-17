/* eslint-disable react/function-component-definition */
import React from 'react';
import { Meta, StoryObj } from '@storybook/react';

import CopyButton from './CopyButton';

export default {
    title: 'Shared/CopyButton',
    component: CopyButton,
} as Meta<typeof CopyButton>;

export const Primary: StoryObj<typeof CopyButton> = {
    render: (args) => {
        return <CopyButton {...args} />;
    },
    args: {
        value: 'Copied string!',
    },
};

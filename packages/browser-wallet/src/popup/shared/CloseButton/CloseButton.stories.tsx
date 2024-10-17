/* eslint-disable react/function-component-definition */
import React from 'react';
import { Meta, StoryObj } from '@storybook/react';

import CloseButton from './CloseButton';

export default {
    title: 'Shared/CloseButton',
    component: CloseButton,
} as Meta<typeof CloseButton>;

export const Primary: StoryObj<typeof CloseButton> = {
    render: () => {
        return <CloseButton />;
    },
};

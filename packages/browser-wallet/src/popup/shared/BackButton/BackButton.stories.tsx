/* eslint-disable react/function-component-definition */
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Meta, StoryObj } from '@storybook/react';

import BackButton from './BackButton';

export default {
    title: 'Shared/BackButton',
    component: BackButton,
} as Meta<typeof BackButton>;

export const Primary: StoryObj<typeof BackButton> = {
    render: () => (
        <MemoryRouter>
            <BackButton />
        </MemoryRouter>
    ),
};

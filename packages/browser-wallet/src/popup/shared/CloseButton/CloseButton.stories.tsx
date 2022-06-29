/* eslint-disable react/function-component-definition */
import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import CloseButton from './CloseButton';

export default {
    title: 'Shared/CloseButton',
    component: CloseButton,
} as ComponentMeta<typeof CloseButton>;

export const Primary: ComponentStory<typeof CloseButton> = () => {
    return <CloseButton />;
};

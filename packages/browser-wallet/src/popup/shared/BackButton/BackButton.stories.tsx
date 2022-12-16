/* eslint-disable react/function-component-definition */
import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import BackButton from './BackButton';

export default {
    title: 'Shared/BackButton',
    component: BackButton,
} as ComponentMeta<typeof BackButton>;

export const Primary: ComponentStory<typeof BackButton> = () => {
    return <BackButton />;
};

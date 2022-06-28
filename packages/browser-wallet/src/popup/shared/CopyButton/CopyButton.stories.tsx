/* eslint-disable react/function-component-definition */
import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import CopyButton from './CopyButton';

export default {
    title: 'Shared/CopyButton',
    component: CopyButton,
} as ComponentMeta<typeof CopyButton>;

const Template: ComponentStory<typeof CopyButton> = (args) => {
    return <CopyButton {...args} />;
};

export const Primary = Template.bind({});
Primary.args = {
    value: 'Copied string!',
};

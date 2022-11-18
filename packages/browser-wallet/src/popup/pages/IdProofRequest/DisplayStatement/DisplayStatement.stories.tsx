/* eslint-disable react/function-component-definition */
import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import DisplayStatement from './DisplayStatement';

export default {
    title: 'Pages/IdProofRequest/DisplayStatement',
    component: DisplayStatement,
} as ComponentMeta<typeof DisplayStatement>;

const Template: ComponentStory<typeof DisplayStatement> = () => {
    return (
        <div style={{ width: 300 }}>
            <DisplayStatement className="w-full" />
        </div>
    );
};
export const Primary = Template.bind({});
Primary.args = {};

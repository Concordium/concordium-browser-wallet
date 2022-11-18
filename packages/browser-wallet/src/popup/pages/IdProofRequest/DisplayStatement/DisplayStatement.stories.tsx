/* eslint-disable react/function-component-definition */
import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import DisplayStatement from './DisplayStatement';

export default {
    title: 'Pages/IdProofRequest/DisplayStatement',
    component: DisplayStatement,
} as ComponentMeta<typeof DisplayStatement>;

const Template: ComponentStory<typeof DisplayStatement> = (args) => {
    return (
        <div style={{ width: 300 }}>
            <DisplayStatement className="w-full" {...args} />
        </div>
    );
};

export const RevealAttributes = Template.bind({});
RevealAttributes.args = {
    dappName: 'Test dApp',
    reveal: true,
    lines: [
        { attribute: 'Attribute', value: 'A valid value', isRequirementMet: true },
        { attribute: 'Another attribute', value: 'Value', isRequirementMet: false },
    ],
};

export const Secret = Template.bind({});
Secret.args = {
    dappName: 'Test dApp',
    reveal: false,
    lines: [{ attribute: 'Attribute', value: 'A valid value', isRequirementMet: true }],
};

/* eslint-disable react/function-component-definition */
import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { DisplayStatementView } from './DisplayStatement';

export default {
    title: 'Pages/IdProofRequest/DisplayStatement',
    component: DisplayStatementView,
} as ComponentMeta<typeof DisplayStatementView>;

const Template: ComponentStory<typeof DisplayStatementView> = (args) => {
    return (
        <div style={{ width: 330 }}>
            <DisplayStatementView className="w-full" {...args} />
        </div>
    );
};

export const RevealAttributes = Template.bind({});
RevealAttributes.args = {
    dappName: 'Test dApp',
    header: 'Information to reveal',
    reveal: true,
    lines: [
        { attribute: 'First name', value: 'John', isRequirementMet: true },
        { attribute: 'Last name', value: 'Johnson', isRequirementMet: false },
        { attribute: 'ID document type', value: 'Passport', isRequirementMet: false },
    ],
};

export const AgeMinProof = Template.bind({});
AgeMinProof.args = {
    dappName: 'Test dApp',
    header: 'Secret proof of age',
    reveal: false,
    description: 'You date of birth is before YYYY-MM-DD.',
    lines: [{ attribute: 'Age', value: 'More than X years old', isRequirementMet: true }],
};

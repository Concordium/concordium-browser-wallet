/* eslint-disable react/function-component-definition */
import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { DisplayStatementView } from './DisplayStatement';

export default {
    title: 'Pages/IdProofRequest/DisplayStatement',
    component: DisplayStatementView,
} as Meta<typeof DisplayStatementView>;

type Story = StoryObj<typeof DisplayStatementView>;

const render: Story['render'] = (args) => {
    return (
        <div style={{ width: 330 }}>
            <DisplayStatementView className="w-full" {...args} />
        </div>
    );
};

export const ValidRevealAttributes: Story = {
    args: {
        dappName: 'Test dApp',
        header: 'Information to reveal',
        reveal: true,
        lines: [
            { attribute: 'First name', value: 'John', isRequirementMet: true },
            { attribute: 'Last name', value: 'Johnson', isRequirementMet: true },
        ],
    },
    render,
};
export const InvalidRevealAttributes: Story = {
    args: {
        dappName: 'Test dApp',
        header: 'Information to reveal',
        reveal: true,
        lines: [
            { attribute: 'First name', value: 'John', isRequirementMet: true },
            { attribute: 'Last name', value: 'Johnson', isRequirementMet: true },
            { attribute: 'ID document type', value: 'Passport', isRequirementMet: false },
        ],
    },
    render,
};
export const ValidSecretProof: Story = {
    args: {
        dappName: 'Test dApp',
        header: 'Secret proof of age',
        reveal: false,
        description: 'You date of birth is before YYYY-MM-DD.',
        lines: [{ attribute: 'Age', value: 'More than X years old', isRequirementMet: true }],
    },
    render,
};
export const InvalidSecretProof: Story = {
    args: {
        dappName: 'Test dApp',
        header: 'Secret proof of identity document issuer',
        reveal: false,
        description:
            'Your identity document issuer is one of the following:\nAndorra, United Arab Emirates, Afghanistan, Antigua and Barbuda, Anguilla, Albania, Benin, Brazil, Bahamas, Bhutan, Belize, Canada, Chile, Spain, Finland, Fiji, Ghana, Hong Kong, Indonesia, Korea, Mali, Malta, Malawi, Mexico, Mozambique, Namibia, Nigeria, Nicaragua, Panama, Peru',
        lines: [{ attribute: 'Document issuer', value: '1 of 30 issuers', isRequirementMet: false }],
    },
    render,
};

/* eslint-disable react/function-component-definition, react/destructuring-assignment */
import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { VerifiableCredentialStatus } from '@shared/storage/types';
import { Web3IdCardView } from './Web3IdCard';

export default {
    title: 'X/Shared/Web3IdCard',
    component: Web3IdCardView,
    beforeEach: () => {
        const body = document.getElementsByTagName('body').item(0);
        body?.classList.add('popup-x');

        return () => {
            body?.classList.remove('popup-x');
        };
    },
    tags: ['!autodocs'],
    render(args) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Web3IdCardView {...args} />
            </div>
        );
    },
} as Meta<typeof Web3IdCardView>;

type Story = StoryObj<typeof Web3IdCardView>;

export const Primary: Story = {
    args: {
        title: 'Credential title',
        status: VerifiableCredentialStatus.Active,
        attributes: [
            { title: 'Attribute title', value: 'Attribute value' },
            { title: 'Attribute title', value: 'Attribute value' },
        ],
    },
};

export const Logo: Story = {
    args: {
        title: 'Credential title',
        status: VerifiableCredentialStatus.Active,
        attributes: [
            { title: 'Attribute title', value: 'Attribute value' },
            { title: 'Attribute title', value: 'Attribute value' },
        ],
        logo: { url: 'https://img.logoipsum.com/298.svg' },
    },
};

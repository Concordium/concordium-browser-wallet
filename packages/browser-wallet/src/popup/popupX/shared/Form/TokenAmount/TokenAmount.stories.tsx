/* eslint-disable prefer-destructuring */
import React from 'react';
import { useForm } from 'react-hook-form';
import { Meta, StoryObj } from '@storybook/react';
import { CcdAmount, ContractAddress } from '@concordium/web-sdk';

import TokenAmount from './TokenAmount';

export default {
    title: 'X/Shared/Form/TokenAmount',
    component: TokenAmount,
    decorators: [
        (Story, context) => {
            const form = useForm<{ amount: string; receiver?: string }>({
                defaultValues: {
                    amount: '1000',
                    receiver: '3ybJ66spZ2xdWF3avgxQb2meouYa7mpvMWNPmUnczU8FoF8cGB',
                },
            });
            const args = context.args;
            args.form = form;
            return <Story {...context} />;
        },
    ],
    beforeEach: () => {
        const body = document.getElementsByTagName('body').item(0);
        body?.classList.add('popup-x');

        return () => {
            body?.classList.remove('popup-x');
        };
    },
} as Meta<typeof TokenAmount>;

type Story = StoryObj<typeof TokenAmount>;

export const OnlyAmount: Story = {
    args: {
        token: 'ccd',
        fee: CcdAmount.fromCcd(0.032),
        buttonMaxLabel: 'Stake max.',
        receiver: false,
    },
};

export const WithReceiver: Story = {
    args: {
        buttonMaxLabel: 'Send max.',
        fee: CcdAmount.fromCcd(0.032),
        receiver: true,
    },
};

export const TokenWithReceiver: Story = {
    args: {
        token: 'cis2',
        address: { id: '', contract: ContractAddress.create(123, 0) },
        buttonMaxLabel: 'Send max.',
        fee: CcdAmount.fromCcd(0.132),
        receiver: true,
    },
};

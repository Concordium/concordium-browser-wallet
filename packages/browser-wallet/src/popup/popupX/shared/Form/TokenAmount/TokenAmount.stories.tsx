import { Meta, StoryObj } from '@storybook/react';
import { AccountAddress, CcdAmount, ContractAddress } from '@concordium/web-sdk';

import TokenAmount from './TokenAmount';

export default {
    title: 'X/Shared/TokenAmount',
    component: TokenAmount,
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
        value: { amount: 100n },
        buttonMaxLabel: 'Stake max.',
        receiver: false,
    },
};

export const WithReceiver: Story = {
    args: {
        token: 'ccd',
        buttonMaxLabel: 'Send max.',
        fee: CcdAmount.fromCcd(0.032),
        receiver: true,
        value: {
            amount: 1000n,
            receiver: AccountAddress.fromBase58('4UC8o4m8AgTxt5VBFMdLwMCwwJQVJwjesNzW7RPXkACynrULmd'),
        },
    },
};

export const TokenWithReceiver: Story = {
    args: {
        token: 'cis2',
        address: { id: '', contract: ContractAddress.create(123, 0) },
        buttonMaxLabel: 'Send max.',
        fee: CcdAmount.fromCcd(0.132),
        receiver: true,
        value: {
            amount: 1000n,
            receiver: AccountAddress.fromBase58('4UC8o4m8AgTxt5VBFMdLwMCwwJQVJwjesNzW7RPXkACynrULmd'),
        },
    },
};

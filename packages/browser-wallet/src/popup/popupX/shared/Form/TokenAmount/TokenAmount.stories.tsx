/* eslint-disable no-console */
/* eslint-disable prefer-destructuring */
import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { CcdAmount, ContractAddress } from '@concordium/web-sdk';
import { PropsOf } from 'wallet-common-helpers';

import TokenAmountView, { AmountReceiveForm } from './View';
import Form, { useForm } from '..';

function Wrapper(props: PropsOf<typeof TokenAmountView>) {
    const form = useForm<AmountReceiveForm>({
        mode: 'onTouched',
        defaultValues: {
            amount: '1,000.00',
            receiver: '3ybJ66spZ2xdWF3avgxQb2meouYa7mpvMWNPmUnczU8FoF8cGB',
        },
    });
    return (
        <Form formMethods={form} onSubmit={console.log}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {() => <TokenAmountView {...props} form={form as any} />}
        </Form>
    );
}

export default {
    title: 'X/Shared/Form/TokenAmount',
    component: TokenAmountView,
    render: (props) => <Wrapper {...props} />,
    beforeEach: () => {
        const body = document.getElementsByTagName('body').item(0);
        body?.classList.add('popup-x');

        return () => {
            body?.classList.remove('popup-x');
        };
    },
} as Meta<typeof TokenAmountView>;

type Story = StoryObj<typeof TokenAmountView>;

const tokens = [
    {
        id: '',
        contract: ContractAddress.create(123, 0),
        metadata: {
            symbol: 'wETH',
            name: 'Wrapped Ether',
            decimals: 18,
            thumbnail: { url: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2396.png' },
        },
    },
    {
        id: '',
        contract: ContractAddress.create(432, 0),
        metadata: { symbol: 'wCCD', name: 'Wrapped CCD', decimals: 6 },
    },
];

export const OnlyAmount: Story = {
    args: {
        tokenType: 'ccd',
        fee: CcdAmount.fromCcd(0.032),
        buttonMaxLabel: 'Stake max.',
        receiver: false,
        tokens,
        balance: 17004000000n,
    },
};

export const WithReceiver: Story = {
    args: {
        buttonMaxLabel: 'Send max.',
        fee: CcdAmount.fromCcd(0.032),
        receiver: true,
        tokens,
        balance: 17004000000n,
    },
};

export const TokenWithReceiver: Story = {
    args: {
        tokenType: 'cis2',
        tokenAddress: { id: '', contract: ContractAddress.create(123, 0) },
        buttonMaxLabel: 'Send max.',
        fee: CcdAmount.fromCcd(0.132),
        receiver: true,
        tokens,
        balance: 17004000000n,
    },
};

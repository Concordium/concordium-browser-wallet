/* eslint-disable react/function-component-definition */
import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { CcdAmount, CooldownStatus, Timestamp } from '@concordium/web-sdk';

import AccountCooldowns from './AccountCooldowns';

const render: Story['render'] = (args) => {
    return (
        <div style={{ width: 330 }}>
            <AccountCooldowns {...args} />
        </div>
    );
};

export default {
    title: 'X/Pages/EarningRewards/AccountCooldowns',
    component: AccountCooldowns,
    render,
    beforeEach: () => {
        const body = document.getElementsByTagName('body').item(0);
        body?.classList.add('popup-x');

        return () => {
            body?.classList.remove('popup-x');
        };
    },
} as Meta<typeof AccountCooldowns>;

type Story = StoryObj<typeof AccountCooldowns>;
const day = 1000 * 60 * 60 * 24;

export const ValidRevealAttributes: Story = {
    args: {
        cooldowns: [
            {
                amount: CcdAmount.fromCcd(100),
                status: CooldownStatus.Cooldown,
                timestamp: Timestamp.fromMillis(Date.now() + day * 4),
            },
            {
                amount: CcdAmount.fromCcd(100),
                status: CooldownStatus.Cooldown,
                timestamp: Timestamp.fromMillis(Date.now() + day * 2),
            },
        ],
    },
};

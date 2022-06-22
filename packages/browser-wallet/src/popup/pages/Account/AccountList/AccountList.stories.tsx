/* eslint-disable react/function-component-definition, import/no-extraneous-dependencies, react/destructuring-assignment */
import React, { useState } from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import AccountList, { Account } from './AccountList';

export default {
    title: 'Pages/Account/AccountList',
    component: AccountList,
} as ComponentMeta<typeof AccountList>;

const Template: ComponentStory<typeof AccountList> = (args) => {
    const [selected, setSelected] = useState(args.selected ?? args.accounts[0]);
    return (
        <div style={{ width: 300 }}>
            <AccountList {...args} selected={selected} onSelect={setSelected} />
        </div>
    );
};

const accounts: Account[] = [{ address: '01234567' }, { address: '12345678' }, { address: '23456789' }];

export const Primary = Template.bind({});
Primary.args = {
    accounts,
};

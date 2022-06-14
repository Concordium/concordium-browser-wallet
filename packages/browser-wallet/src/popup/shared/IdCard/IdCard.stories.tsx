/* eslint-disable react/function-component-definition, import/no-extraneous-dependencies */
import React, { useState } from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import IdCard from './IdCard';

export default {
    title: 'Shared/IdCard',
    component: IdCard,
} as ComponentMeta<typeof IdCard>;

const Template: ComponentStory<typeof IdCard> = (args) => {
    // eslint-disable-next-line react/destructuring-assignment
    const [name, setName] = useState(args.name);
    return <IdCard {...args} name={name} onNameChange={setName} />;
};

export const Pending = Template.bind({});
Pending.args = {
    name: 'Name',
    status: 'pending',
    provider: <>DTS</>,
};

export const Approved = Template.bind({});
Approved.args = {
    name: 'Name',
    status: 'verified',
    provider: <>DTS</>,
};

export const Rejected = Template.bind({});
Rejected.args = {
    name: 'Name',
    status: 'rejected',
    provider: <>DTS</>,
};

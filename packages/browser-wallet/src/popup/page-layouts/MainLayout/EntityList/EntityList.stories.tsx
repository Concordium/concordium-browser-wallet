/* eslint-disable react/function-component-definition, import/no-extraneous-dependencies */
import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import clsx from 'clsx';
import EntityList from './EntityList';

export default {
    title: 'Page layouts/MainLayout/EntityList',
    component: EntityList,
} as ComponentMeta<typeof EntityList>;

type Entity = { id: number; text: string };

const Template: ComponentStory<typeof EntityList> = (args) => {
    return (
        <>
            <style>
                {`
                .sb-entity-list-item {
                    padding: 0 0.3rem;
                }
                .sb-entity-list-item--checked {
                    color: green;
                    margin-left: 0.5rem;
                }
            `}
            </style>
            {/* eslint-disable-next-line no-console */}
            <EntityList {...args} onSelect={console.log} />
        </>
    );
};

const entities: Entity[] = ['First', 'Second', 'Third'].map((e, i) => ({ id: i, text: e }));

export const Primary = Template.bind({});
Primary.args = {
    entities,
    children: (e: Entity, checked) => (
        <div className={clsx('sb-entity-list-item', checked && 'sb-entity-list-item--checked')}>{e.text}</div>
    ),
    getKey: (e: Entity) => e.id,
    searchableKeys: ['text'],
    newText: 'Add new',
};

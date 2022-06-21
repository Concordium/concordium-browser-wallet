/* eslint-disable react/function-component-definition, import/no-extraneous-dependencies */
import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
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
                input:focus + .sb-entity-list-item {
                    color: green;
                }
            `}
            </style>
            <EntityList {...args} />
        </>
    );
};

const entities: Entity[] = ['first', 'second', 'third'].map((e, i) => ({ id: i, text: e }));

export const Primary = Template.bind({});
Primary.args = {
    entities,
    children: (e: Entity) => <div className="sb-entity-list-item">{e.text}</div>,
    getKey: (e: Entity) => e.id,
    searchableKeys: ['text'],
};

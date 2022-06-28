/* eslint-disable react/function-component-definition */
import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import Carousel from './Carousel';

export default {
    title: 'Shared/Carousel',
    component: Carousel,
} as ComponentMeta<typeof Carousel>;

export const Primary: ComponentStory<typeof Carousel> = () => {
    return (
        <div style={{ width: 300 }}>
            <Carousel />
        </div>
    );
};

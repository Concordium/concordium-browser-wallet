/* eslint-disable react/function-component-definition */
import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { noOp } from 'wallet-common-helpers';

import Carousel from './Carousel';

export default {
    title: 'Shared/Carousel',
    component: Carousel,
} as ComponentMeta<typeof Carousel>;

export const Primary: ComponentStory<typeof Carousel> = () => {
    return (
        <div style={{ width: 300, height: 400 }}>
            <Carousel onContinue={noOp}>
                <div>First</div>
                <div>Second</div>
                <div>Third</div>
            </Carousel>
        </div>
    );
};

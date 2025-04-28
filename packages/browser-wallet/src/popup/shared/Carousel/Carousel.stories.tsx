/* eslint-disable react/function-component-definition */
import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { noOp } from 'wallet-common-helpers';

import Carousel from './Carousel';

export default {
    title: 'Shared/Carousel',
    component: Carousel,
} as Meta<typeof Carousel>;

export const Primary: StoryObj<typeof Carousel> = {
    render: () => {
        return (
            <div style={{ width: 300, height: 400 }}>
                <Carousel onContinue={noOp}>
                    <div>First</div>
                    <div>Second</div>
                    <div>Third</div>
                </Carousel>
            </div>
        );
    },
};

export const SingleChild: StoryObj<typeof Carousel> = {
    render: () => {
        return (
            <div style={{ width: 300, height: 400 }}>
                <Carousel onContinue={noOp}>
                    <div>First</div>
                </Carousel>
            </div>
        );
    },
};

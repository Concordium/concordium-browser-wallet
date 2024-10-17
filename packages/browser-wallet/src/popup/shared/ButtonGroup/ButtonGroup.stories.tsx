/* eslint-disable react/function-component-definition */
import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import ButtonGroup from './ButtonGroup';
import Button from '../Button';

export default {
    title: 'Shared/ButtonGroup',
    component: ButtonGroup,
} as Meta<typeof ButtonGroup>;

export const TwoButtons: StoryObj<typeof ButtonGroup> = {
    render: () => {
        return (
            <div style={{ width: 300 }}>
                <ButtonGroup>
                    <Button>Back</Button>
                    <Button>Next</Button>
                </ButtonGroup>
            </div>
        );
    },
};

export const FocusSecond: StoryObj<typeof ButtonGroup> = {
    render: () => {
        return (
            <div style={{ width: 300 }}>
                <ButtonGroup>
                    <Button faded>?</Button>
                    <Button width="wide">Confirm</Button>
                </ButtonGroup>
            </div>
        );
    },
};

export const ThreeButtons: StoryObj<typeof ButtonGroup> = {
    render: () => {
        return (
            <div style={{ width: 300 }}>
                <ButtonGroup>
                    <Button>First</Button>
                    <Button>Second</Button>
                    <Button>Third</Button>
                </ButtonGroup>
            </div>
        );
    },
};

export const CenterWide: StoryObj<typeof ButtonGroup> = {
    render: () => {
        return (
            <div style={{ width: 300 }}>
                <ButtonGroup>
                    <Button>First</Button>
                    <Button width="medium">Second</Button>
                    <Button>Third</Button>
                </ButtonGroup>
            </div>
        );
    },
};

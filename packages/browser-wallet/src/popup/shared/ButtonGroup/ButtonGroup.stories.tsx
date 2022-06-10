/* eslint-disable react/function-component-definition, import/no-extraneous-dependencies */
import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import ButtonGroup from './ButtonGroup';
import Button from '../Button';

export default {
    title: 'Shared/ButtonGroup',
    component: ButtonGroup,
} as ComponentMeta<typeof ButtonGroup>;

export const TwoButtons: ComponentStory<typeof ButtonGroup> = () => {
    return (
        <div style={{ width: 300 }}>
            <ButtonGroup>
                <Button>Back</Button>
                <Button>Next</Button>
            </ButtonGroup>
        </div>
    );
};

export const FocusSecond: ComponentStory<typeof ButtonGroup> = () => {
    return (
        <div style={{ width: 300 }}>
            <ButtonGroup>
                <Button faded>?</Button>
                <Button width="wide">Confirm</Button>
            </ButtonGroup>
        </div>
    );
};

export const ThreeButtons: ComponentStory<typeof ButtonGroup> = () => {
    return (
        <div style={{ width: 300 }}>
            <ButtonGroup>
                <Button>First</Button>
                <Button>Second</Button>
                <Button>Third</Button>
            </ButtonGroup>
        </div>
    );
};

export const CenterWide: ComponentStory<typeof ButtonGroup> = () => {
    return (
        <div style={{ width: 300 }}>
            <ButtonGroup>
                <Button>First</Button>
                <Button width="narrow">Second</Button>
                <Button>Third</Button>
            </ButtonGroup>
        </div>
    );
};

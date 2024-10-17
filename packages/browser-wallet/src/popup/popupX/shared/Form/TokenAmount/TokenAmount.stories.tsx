import { Meta, StoryObj } from '@storybook/react';
import TokenAmount from './TokenAmount';

export default {
    title: 'X/Shared/TokenAmount',
    component: TokenAmount,
} as Meta<typeof TokenAmount>;

export const Primary: StoryObj<typeof TokenAmount> = {
    args: {
        token: { type: 'ccd' },
    },
    beforeEach: () => {
        const body = document.getElementsByTagName('body').item(0);
        body?.classList.add('popup-x');

        return () => {
            body?.classList.remove('popup-x');
        };
    },
};

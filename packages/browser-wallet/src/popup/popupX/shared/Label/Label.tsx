import clsx from 'clsx';
import React, { ReactNode } from 'react';
import Text from '@popup/popupX/shared/Text';

type LabelColors = 'grey' | 'light-grey' | 'green' | 'yellow' | 'red' | string;

type LabelProps = {
    icon: ReactNode;
    color: LabelColors;
    text: string;
    className?: string;
};

function Label({ icon, color, text, className }: LabelProps) {
    return (
        <span className={clsx(color, className, 'label-x')}>
            <div className="icon">{icon}</div>
            <Text.Label>{text}</Text.Label>
        </span>
    );
}

export default Label;

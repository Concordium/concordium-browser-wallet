import clsx from 'clsx';
import React from 'react';

type Props = {
    // eslint-disable-next-line react/no-unused-prop-types
    title: string;
    // eslint-disable-next-line react/no-unused-prop-types
    canGoBack?: boolean;
};

type FlowProps = Props & {
    steps: number;
    completedSteps: number;
};

function FlowProgress({ steps, completedSteps }: FlowProps) {
    const points = new Array(steps).fill(0).map((_, i) => i + 1);

    return (
        <div className="page-header__progress-bar">
            {points.map((s) => (
                <div
                    className={clsx(
                        'page-header__progress-bar-point',
                        completedSteps >= s && 'page-header__progress-bar-point--completed'
                    )}
                />
            ))}
        </div>
    );
}

const isFlow = (props: Props | FlowProps): props is FlowProps => (props as FlowProps).steps !== undefined;

export default function PageHeader(props: Props | FlowProps) {
    const { title, canGoBack } = props;

    return (
        <header className="page-header">
            <div className="page-header__icon">{canGoBack ? '<' : 'Icon'}</div>
            <div className="flexColumn justifyCenter flexChildFill">
                <h1 className="page-header__title">{title}</h1>
                {isFlow(props) && <FlowProgress {...props} />}
            </div>
        </header>
    );
}

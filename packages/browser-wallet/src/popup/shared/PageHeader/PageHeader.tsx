import clsx from 'clsx';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import BackIcon from '@assets/svg/back-arrow.svg';
import Logo from '@assets/svg/concordium.svg';
import Button from '../Button';

type Props = {
    // eslint-disable-next-line react/no-unused-prop-types
    title: string;
    // eslint-disable-next-line react/no-unused-prop-types
    canGoBack?: boolean;
};

type FlowProps = Props & {
    steps: number;
    activeStep: number;
};

function FlowProgress({ steps, activeStep }: FlowProps) {
    const points = new Array(steps).fill(0).map((_, i) => i + 1);

    return (
        <div className="page-header__progress-bar">
            {points.map((s) => (
                <div
                    className={clsx(
                        'page-header__progress-bar-point',
                        activeStep >= s && 'page-header__progress-bar-point--completed'
                    )}
                />
            ))}
        </div>
    );
}

const isFlow = (props: Props | FlowProps): props is FlowProps => (props as FlowProps).steps !== undefined;

export default function PageHeader(props: Props | FlowProps) {
    const { title, canGoBack } = props;
    const navigate = useNavigate();

    return (
        <header className="page-header">
            <div className="page-header__icon">
                {canGoBack ? (
                    <Button className="flex" clear onClick={() => navigate(-1)}>
                        <BackIcon className="page-header__back-icon" />
                    </Button>
                ) : (
                    <Logo className="page-header__logo" />
                )}
            </div>
            <div className="flexColumn justifyCenter flexChildFill">
                <h1 className="page-header__title">{title}</h1>
                {isFlow(props) && <FlowProgress {...props} />}
            </div>
        </header>
    );
}

import React from 'react';
import Info from '@assets/svgX/info.svg';
import Dot from '@assets/svgX/dot.svg';

type Props = {
    hideConnection: boolean;
};

export default function Connection({ hideConnection }: Props) {
    if (hideConnection) return null;
    return (
        <div className="main-header__connection">
            <div className="main-header__connection_info">
                <span className="connection_status">
                    <Dot />
                    <span className="capture__main_small">No website connected</span>
                </span>
                <Info />
            </div>
        </div>
    );
}

import React from 'react';
import ArrowRight from '@assets/svgX/arrow-right.svg';
import Info from '@assets/svgX/info.svg';

export default function EarningRewards() {
    return (
        <div className="earn-container">
            <div className="earn__title">
                <span className="heading_medium">Earning Rewards</span>
            </div>
            <div className="earn__card">
                <span className="text__main">Baking</span>
                <span className="capture__main_small">
                    As a baker you can participate in the network by baking blocks on the Concordium network. This
                    requires a minimum of 14,000.00 CCD and access to a dedicated node.
                </span>
                <div className="earn__card_continue">
                    <span className="label__regular">Continue to baker setup</span>
                    <ArrowRight />
                </div>
            </div>
            <div className="earn__card">
                <span className="text__main">Delegation</span>
                <span className="capture__main_small">
                    If you don’t have access to your own node you may delegate your stake to one of the other bakers.
                    There is no minimum amount of CCD required when delegating.
                </span>
                <div className="earn__card_continue">
                    <span className="label__regular">Continue to delegation setup</span>
                    <ArrowRight />
                </div>
            </div>
            <div className="earn__info">
                <div className="earn__info_icon">
                    <Info />
                </div>
                <span className="capture__main_small">
                    Please note, a single account cannot both be a baker and delegator but it is possible to stop one
                    and change to the other.
                </span>
            </div>
        </div>
    );
}

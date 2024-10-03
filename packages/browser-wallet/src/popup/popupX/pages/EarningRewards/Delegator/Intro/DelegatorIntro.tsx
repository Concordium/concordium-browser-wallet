import React from 'react';
import Carousel from '@popup/popupX/shared/Carousel';

export default function DelegatorIntro() {
    return (
        <div className="delegator-intro-container">
            <div className="delegator-intro__title">
                <span className="heading_medium">Delegation</span>
            </div>
            <Carousel>
                <span className="capture__main_small">
                    <div>
                        Delegation allows users on the Concordium blockchain to earn rewards without the need to become
                        a validator or run a node.
                    </div>
                    <div>By delegating some of your funds to a pool, you can earn rewards.</div>
                    <div>
                        On the next few pages, we will go through the basics of delegation. If you want to learn more,
                        you can visit our
                        <a
                            className="capture__main_small"
                            href="https://developer.concordium.software/en/mainnet/net/concepts/concepts-delegation.html"
                        >
                            documentation website
                        </a>
                    </div>
                </span>
                <span className="capture__main_small">
                    <div>
                        To become a delegator you must run a node on the Concordium blockchain. Make sure that you have
                        a setup where the node can operate around the clock.
                    </div>
                    <div>
                        You can run the node yourself or use a third-party provider. Make sure your account in the
                        wallet has the required amount of CCD to become a delegator.
                    </div>
                </span>
                <span className="capture__main_small">
                    <div>
                        You have the option when adding a delegator to open a staking pool or not. A staking pool allows
                        others who want to earn rewards to do so without the need to run a node or become a delegator
                        themselves.
                    </div>
                    <div>
                        To do this they delegate an amount to your staking pool which then increases your total stake
                        and your chances of winning the lottery to bake a block. At each pay day the rewards will be
                        distributed to you and your delegators.
                    </div>
                    <div>
                        You can also choose not to open a pool, in which case only your own stake applies toward the
                        lottery. You can always open or close a pool later.
                    </div>
                </span>
            </Carousel>
        </div>
    );
}

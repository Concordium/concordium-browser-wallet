import React from 'react';
import Carousel from '@popup/popupX/shared/Carousel';

export default function BakerIntro() {
    return (
        <div className="baker-intro-container">
            <div className="baker-intro__title">
                <span className="heading_medium">Become a baker</span>
            </div>
            <Carousel>
                <span className="capture__main_small">
                    <div>
                        A baker is a mode that participates in the network by baking (creating) new blocks that are
                        added to the chain. Each baker has a set of cryptographic keys called baker keys that are node
                        needs to bake blocks.
                    </div>
                    <div>
                        You generate the baker keys in the Mobile Wallet when you add a baker account. Once the baker
                        node has been restarted with the baker keys, it will start baking two epochs after the
                        transaction has been approved.
                    </div>
                </span>
                <span className="capture__main_small">
                    <div>
                        To become a baker you must run a node on the Concordium blockchain. Make sure that you have a
                        setup where the node can operate around the clock.
                    </div>
                    <div>
                        You can run the node yourself or use a third-party provider. Make sure your account in the
                        wallet has the required amount of CCD to become a baker.
                    </div>
                </span>
                <span className="capture__main_small">
                    <div>
                        You have the option when adding a baker to open a staking pool or not. A staking pool allows
                        others who want to earn rewards to do so without the need to run a node or become a baker
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

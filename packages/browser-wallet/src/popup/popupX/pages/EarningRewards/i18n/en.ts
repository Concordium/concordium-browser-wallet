const t = {
    root: {
        bakerTitle: 'Validation',
        bakerDescription:
            'As a baker, you can participate in the network by baking blocks on the Concordium network. This requires a minimum of {{amount}} CCD and access to a dedicated node.',
        bakerAction: 'Continue to validation setup',
        delegationTitle: 'Delegation',
        delegationDescription:
            'If you don’t have access to your own node, you may delegate your stake to one of the other bakers. There is no minimum amount of CCD required when delegating.',
        delegationAction: 'Continue to delegation setup',
        note: 'Please note, a single account cannot both be a baker and a delegator, but it is possible to stop one and change to the other.',
    },
    delegator: {
        intro: {
            '1': {
                title: 'Delegation',
                body: 'Delegation allows users on the Concordium blockchain to earn rewards without the need to become a validator or run a node.\n\nBy delegating some of your funds to a pool, you can earn rewards.\n\nOn the next few pages, we will go through the basics of delegation. If you want to learn more, you can visit our <1>documentation website</1>.',
            },
            '2': {
                title: 'Delegation models',
                body: "There are two staking models that a delegator can choose:<ul><li>Delegating to a specific pool</li><li>Passive delegation</li></ul>A staking pool is managed by an individual validator running a node, so the rewards depend on that validator's performance.\n\nSince passive delegation doesn't go to a specific pool, it mitigates the risk of a single validator performing badly, however, the rewards are lower.\n\nFor more info, visit our <1>documentation website</1>",
            },
            '3': {
                title: 'Staking pools',
                body: "A staking pool is managed by an individual validator.\n\nRunning a pool allows a validator to attract more stake and thus increase chances of being selected to produce a block.\n\nValidators earn a commission from the delegators upon producing a block.\n\nDelegating to a staking pool is usually more profitable than passive delegation, but there is also a risk of losing out on rewards if the validator is not running properly. It is therefore a good idea to keep an eye on the validator's performance.\n\nYou can read more about how to investigate a validator's performance on our <1>documentation website</1>.",
            },
            '4': {
                title: 'Passive delegation',
                body: 'For CCD holders who do not want to regularly check the performance of a chosen pool, but just want a stable way of earning rewards, passive delegation offers a low-risk, low-reward alternative.\n\nThis staking strategy is not associated with a specific validator, so there is no risk of poor validator health.\n\nThe trade-off when choosing passive delegation is that the return on your stake will be less than what you may receive when delegating to a specific staking pool.',
            },
            '5': {
                title: 'Pay days',
                body: 'Whether you choose an individual validation pool or passive delegation, rewards are paid out at what is called the pay day. Rewards are distributed to everyone in the pool proportional to their stake, and a commission is paid to the validator by all delegators.\n\nIf you make updates to your delegation at a later point, most of these will also take effect from the next pay day.\n\nTo read more about the pay day, you can visit our <1>documentation website</1>.',
            },
            '6': {
                title: 'Lock-ins and cool-downs',
                body: 'When you make a delegation to either type of pool, your delegation amount will be locked on your account.\n\nThis means that you cannot use the amount for anything while it is still locked in for delegation.\n\nIf you decrease your delegation amount or stop the delegation altogether, the amount will still be locked for a cool-down period.\n\nAs transactions cost a fee, it is important to take into consideration that you will need some unlocked funds on your public balance to pay the fee for unlocking your delegation amount again.',
            },
        },
    },
};

export default t;

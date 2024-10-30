const t = {
    root: {
        validatorTitle: 'Validation',
        validatorDescription:
            'As a validator, you can participate in the network by baking blocks on the Concordium network. This requires a minimum of {{amount}} CCD and access to a dedicated node.',
        validatorAction: 'Continue to validation setup',
        delegationTitle: 'Delegation',
        delegationDescription:
            'If you don’t have access to your own node, you may delegate your stake to one of the other validators. There is no minimum amount of CCD required when delegating.',
        delegationAction: 'Continue to delegation setup',
        note: 'Please note, a single account cannot both be a validator and a delegator, but it is possible to stop one and change to the other.',
    },
    cooldowns: {
        inactiveStake: {
            label: 'Inactive stake',
            description:
                'You don’t receive rewards from this part of stake now, this amount will be at disposal after cooldown period.',
        },
        cooldown: {
            label: 'Cooldown time:',
            value_one: 'day left',
            value_other: 'days left',
        },
    },
    delegator: {
        values: {
            target: { label: 'Target', passive: 'Passive delegation', validator: 'Validator {{id}}' },
            amount: { label: 'Delegation amount' },
            redelegate: {
                label: 'Rewards will be',
                delegation: 'Added to delegation amount',
                public: 'Added to public balance',
            },
        },
        status: {
            title: 'Your delegation is registered',
            backTitle: 'to Main page',
            buttonUpdate: 'Update',
            buttonStop: 'Stop',
        },
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
        register: {
            title: 'Register delegation',
            backTitle: 'Earning rewards',
            notice: 'This will lock your delegation amount. Amount is released after {{cooldown}} days from the time you remove or decrease your delegation.',
        },
        update: { title: 'Update delegation' },
        target: {
            description: 'You can delegate to an open pool of your choice, or you can stake using passive delegation.',
            radioValidatorLabel: 'Validator',
            radioPassiveLabel: 'Passive',
            inputValidatorId: {
                label: 'Enter validator pool ID',
                errorRequired: 'Please specify a validator ID',
                errorMin: 'Validator ID cannot be negative',
                errorClosed: 'The validator pool is not open for delegation',
                errorNotValidator: 'The specified ID is not a validator pool',
            },
            validatorDelegationDescription:
                'If you don’t already know which validator pool you want to delegate an amount to, you can look for on <1>here.</1>',
            passiveDelegationDescription:
                'Passive delegation is an alternative to delegation to a specific validator pool that has lower rewards. With passive delegation you do not have to worry about the uptime or quality of a baker node.\nFor more info you can visit <1>developer.concordium.software</1>',
            buttonContinue: 'Continue',
        },
        stake: {
            selectedAccount: 'on {{account}}',
            token: {
                label: 'Token',
                value: 'CCD',
                balance: '{{balance}} CCD available',
            },
            inputAmount: {
                label: 'Amount',
                buttonMax: 'Stake max.',
            },
            fee: {
                label: 'Estimated transaction fee:',
                value: '{{amount}} CCD',
            },
            poolStake: {
                label: 'Current pool',
                value: '{{amount}} CCD',
            },
            poolCap: {
                label: 'Pool limit',
                value: '{{amount}} CCD',
            },
            redelegate: {
                label: 'Restake rewards',
                description: 'I want to automatically add my delegation rewards to my delegation amount.',
            },
            buttonContinue: 'Continue',
        },
        submit: {
            backTitle: 'Delegation settings',
            sender: { label: 'Sender' },
            fee: { label: 'Estimated transaction fee' },
            button: 'Submit delegation',
        },
    },
    validator: {
        values: {
            openStatus: {
                label: 'Status',
                open: 'Open for all ',
                closed: 'Closed for all',
                closedNew: 'Closed for new',
            },
            amount: { label: 'Validation amount' },
            restake: {
                label: 'Rewards will be',
                validation: 'Added to validation amount',
                public: 'Added to public balance',
            },
        },
        status: {
            title: 'Your validation is registered',
            backTitle: 'to Main page',
            buttonUpdate: 'Update',
            buttonStop: 'Stop',
        },
        intro: {
            '1': {
                title: 'Become a validator',
                body: 'A validator is a node that participates in the network by producing new blocks that are added to the chain.\n\nEach validator has a set of cryptographic keys called validator keys that the node needs to produce blocks. You generate the validator keys when you add a validator account.\n\nOnce the validator node has been restarted with the validator keys, it will start validation two epochs after the transaction has been approved.',
            },
            '2': {
                title: 'The node',
                body: 'To become a validator you must run a node on the Concordium blockchain. Make sure that you have a setup where the node can operate around the clock.  You can run the node yourself or use a third-party provider. Make sure your account in the wallet has the required amount of CCD to become a validator.',
            },
            '3': {
                title: 'Opening a pool',
                body: 'You have the option when adding a validator to open a staking pool or not. A staking pool allows others who want to earn rewards to do so without the need to run a node or become a validator themselves.\n\nTo do this they delegate an amount to your staking pool which then increases your total stake and your chances of winning the lottery to bake a block. At each pay day the rewards will be distributed to you and your delegators.\n\nYou can also choose not to open a pool, in which case only your own stake applies toward the lottery. You can always open or close a pool later.',
            },
        },
        register: {
            title: 'Register validator',
            backTitle: 'Earning rewards',
        },
    },
};

export default t;

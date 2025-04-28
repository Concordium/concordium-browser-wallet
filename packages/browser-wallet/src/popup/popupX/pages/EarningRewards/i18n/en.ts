const t = {
    root: {
        validatorTitle: 'Validation',
        validatorDescription:
            'As a validator, you can participate in the network by validating blocks on the Concordium network. This requires a minimum of {{amount}} CCD and access to a dedicated node.',
        validatorAction: 'Continue to validation setup',
        delegationTitle: 'Delegation',
        delegationDescription:
            'If you don’t have access to your own node, you may delegate your stake to one of the other validators. There is no minimum amount of CCD required when delegating.',
        delegationAction: 'Continue to delegation setup',
        note: 'Please note, a single account cannot both be a validator and a delegator, but it is possible to stop one and change to the other.',
    },
    cooldowns: {
        header: 'Cooldown',
        inactiveStake: {
            label: 'Inactive stake',
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
            validatorId: { label: 'Validator ID' },
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
            validatorSuspended: 'Your validator has been suspended',
            validatorSuspendedInfo: 'Your delegation amount does not earn rewards until validation is resumed.',
        },
        intro: {
            '1': {
                title: 'Delegation',
                body: 'Delegation allows users on the Concordium blockchain to earn rewards without the need to become a validator or run a node.\n\nBy delegating some of your funds to a pool, you can earn rewards.\n\nOn the next few pages, we will go through the basics of delegation. If you want to learn more, you can visit our <1>documentation website</1>.',
            },
            '2': {
                title: 'Delegation models',
                body: "There are two staking models that a delegator can choose:<ul><li>Delegating to a specific pool</li><li>Passive delegation</li></ul>A staking pool is managed by an individual validator running a node, so the rewards depend on that validator's performance.\n\nSince passive delegation doesn't go to a specific pool, it mitigates the risk of a single validator performing badly. However, the rewards are lower.\n\nFor more info, visit our <1>documentation website</1>",
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
        update: {
            title: 'Update delegation',
            noChangesNotice: {
                title: 'No changes',
                description: 'The proposed transaction contains no changes compared to the current delegation.',
                buttonBack: 'Go back',
            },
            lowerStakeNotice:
                'Reducing your stake is subject to a cooldown period of {{cooldown}} days, in which the stake cannot be spent or transferred.',
        },
        remove: {
            title: 'Remove delegation',
            notice: 'The delegated stake is released after {{cooldown}} days',
        },
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
                'If you don’t already know which validator pool you want to delegate an amount to, you can look for one <1>here.</1>',
            passiveDelegationDescription:
                'Passive delegation is an alternative to delegation to a specific validator pool that has lower rewards. With passive delegation, you do not have to worry about the uptime or quality of a validator node.\nFor more info, you can visit <1>developer.concordium.software</1>',
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
            overStakeThresholdWarning: {
                title: 'Important',
                description:
                    'You are about to lock more than {{ threshold }}% of your total balance in a delegation stake.\n\nIf you don’t have enough unlocked CCD at your disposal, you might not be able to pay future transaction fees.',
                buttonContinue: 'Continue',
                buttonBack: 'Enter new stake',
            },
        },
        submit: {
            backTitle: 'Delegation settings',
            sender: { label: 'Sender' },
            fee: { label: 'Estimated transaction fee' },
            button: 'Send',
            error: {
                insufficientFunds: 'Insufficient funds on account',
            },
        },
    },
    validator: {
        values: {
            openStatus: {
                label: 'Delegation pool status',
                open: 'Open for delegation',
                closed: 'Closed for delegation',
                closedNew: 'Closed for new delegators',
            },
            amount: { label: 'Validator stake' },
            id: { label: 'Validator ID' },
            restake: {
                label: 'Rewards will be',
                validation: 'Added to validator stake',
                public: 'Added to public balance',
            },
            metadataUrl: { label: 'Metadata URL' },
            electionKey: { label: 'Election verify key' },
            signatureKey: { label: 'Signature verify key' },
            aggregationKey: { label: 'Aggregation verify key' },
            transactionFeeCommission: { label: 'Transaction fee commission' },
            bakingRewardCommission: { label: 'Validation reward commission' },
            finalizationRewardCommission: { label: 'Finalization reward commission' },
        },
        status: {
            title: 'Your validation is registered',
            backTitle: 'to Main page',
            buttonUpdate: 'Update',
            buttonStop: 'Stop',
            buttonSuspend: 'Suspend',
            buttonResume: 'Resume',
            validationSuspended: 'Your validation has been suspended',
            validationSuspendedInfo:
                'Your node does not earn rewards at the moment.\n\nTo lift the suspension and earn rewards again ensure your node is up-to-date and click “Resume”.',
            validationIsPrimedForSuspension: 'Your validation is primed for suspension',
            validationIsPrimedForSuspensionInfo:
                'Your node was inactive for a number of hours. If it has been inactive for too long it will be suspended. Suspended nodes don’t earn rewards.\n\nTo prevent suspension ensure your node is up-to-date and active. Once your node is active you will no longer be primed for suspension.',
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
                body: 'You have the option when adding a validator to open a staking pool or not. A staking pool allows others who want to earn rewards to do so without the need to run a node or become a validator themselves.\n\nTo do this they delegate an amount to your staking pool which then increases your total stake and your chances of winning the lottery to produce a block. At each pay day the rewards will be distributed to you and your delegators.\n\nYou can also choose not to open a pool, in which case only your own stake applies toward the lottery. You can always open or close a pool later.',
            },
            '4': {
                title: 'Suspension',
                body: 'Validators will be marked for suspension if their node is inactive for a longer period of time. \nTo prevent suspension ensure your node is up-to-date and active. Once your node is active you will no longer be primed for suspension.\n\nOnce it has been inactive for a longer period of time the validation will be suspended. \n\n<ul><li>Suspended validators don’t earn rewards</li><li>Your delegators will stop earning rewards</li><li>Your delegators will be notified about the suspension</li></ul>\nTo lift the suspension and earn rewards again ensure your node is up-to-date and click “Resume”.',
            },
        },
        register: {
            title: 'Register validator',
            backTitle: 'Earning rewards',
            notice: 'This will lock your validation amount. Amount is released after {{cooldown}} days from the time you remove or decrease your validation stake.',
        },
        update: {
            title: 'Update validation',
            backTitle: 'Earning rewards',
            noChangesNotice: {
                title: 'No changes',
                description: 'The proposed transaction contains no changes compared to the current validation.',
                buttonBack: 'Go back',
            },
            description: 'Choose what you want to make changes to.',
            buttonStake: 'Update validation stake',
            buttonPoolSettings: 'Update pool settings',
            buttonKeys: 'Update validator keys',
            lowerStakeNotice:
                'Reducing your stake is subject to a cooldown period of {{cooldown}} days, in which the stake cannot be spent or transferred.',
            step: {
                backTitle: 'Update validation',
            },
        },
        remove: {
            title: 'Remove validator',
            notice: 'The validator stake is released after {{cooldown}} days',
        },
        suspend: {
            title: 'Suspend validation',
            notice: 'Valid from next payday',
        },
        resume: {
            title: 'Resume validation',
            notice: 'Effective from next payday',
        },
        selfSuspend: {
            title: 'Important',
            body: 'You are about to self-suspend your validation. Please be aware that:\n\n<ul><li>Suspended nodes don’t earn rewards</li><li>Your delegators will stop earning rewards</li><li>Your delegators will be notified about the suspension</li></ul>',
            continue: 'Continue',
            back: 'Back',
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
                errors: {
                    min: 'A minimum stake of {{min}} CCD is required',
                },
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
            restake: {
                label: 'Restake rewards',
                description: 'I want to automatically add my validation rewards to my validation amount.',
            },
            buttonContinue: 'Continue',
            overStakeThresholdWarning: {
                title: 'Important',
                description:
                    'You are about to lock more than {{ threshold }}% of your total balance in a validation stake.\n\nIf you don’t have enough unlocked CCD at your disposal, you might not be able to pay future transaction fees.',
                buttonContinue: 'Continue',
                buttonBack: 'Enter new stake',
            },
        },
        keys: {
            title: 'Validator keys',
            description:
                'Your new validator keys have been generated. Before you can continue, you must export and save them. The keys will have to be added to the validator node.',
            buttonToggle: { less: 'Show less', full: 'Show full' },
            buttonExport: 'Export as .json',
            buttonContinue: 'Continue',
        },
        openStatus: {
            title: 'Opening a pool',
            switch: {
                label: 'Open for delegation',
            },
            description:
                'Opening a pool\nYou have the option when adding a validator to open a staking pool or not. A staking pool allows others who want to earn rewards to do so without the need to run a node or become a validator themselves.\n\nTo do this they delegate an amount to your staking pool which then increases your total stake and your chances of winning the lottery to produce a block. At each pay day the rewards will be distributed to you and your delegators.\n\nYou can also choose not to open a pool, in which case only your own stake applies toward the lottery. You can always open or close a pool later.',
            buttonContinue: 'Continue',
        },
        metadata: {
            title: 'Metadata',
            description:
                'You can choose to add a URL with metadata about your validator. Leave it blank if you don’t have any.',
            field: {
                label: 'Enter metadata URL',
                error: {
                    maxLength: 'Cannot exceed {{max}} characters',
                },
            },
            buttonContinue: 'Continue',
        },
        commissions: {
            title: 'Commissions',
            desciption:
                'When you open your validator as a pool, you earn commissions of stake delegated to your pool from other accounts:',
            fieldTransactionFee: {
                label: 'Transaction fee commission',
            },
            fieldBlockReward: {
                label: 'Block reward commission',
            },
            fieldFinalizationReward: {
                label: 'Finalization reward commission',
            },
            error: {
                required: 'Please specify a value',
                min: 'Value exceeds lower bound of {{min}}',
                max: 'Value exceeds upper bound of {{max}}',
            },
            buttonContinue: 'Continue',
        },
        submit: {
            backTitle: 'Validation settings',
            sender: { label: 'Sender' },
            fee: { label: 'Estimated transaction fee' },
            error: {
                insufficientFunds: 'Insufficient funds on account',
            },
            button: 'Send',
        },
    },
};

export default t;

const t = {
    noAccounts: 'You have no accounts in your wallet.',
    removeAccount: 'Remove account (local only)',
    resetConnections: 'Reset connections',
    accountAddress: 'Account address',
    siteConnected: 'Connected',
    siteNotConnected: 'Not connected',
    accountBalanceError: 'Unable to retrieve account balance',
    actions: {
        log: 'Transaction log',
        send: 'Send CCD',
        receive: 'Receive CCD',
        earn: 'Earn CCD',
        settings: 'Account settings',
        tokens: 'Tokens',
    },
    details: {
        total: 'Public balance total',
        atDisposal: 'Public amount at disposal',
        stakeAmount: 'Stake / delegation amount',
        stakeWithBaker: 'Stake with validator {{ bakerId }}',
        delegationWithBaker: 'Delegation with staking pool {{ bakerId }}',
        passiveDelegation: 'Passive delegation',
    },
    settings: {
        exportPrivateKey: {
            title: 'Export private key',
            description: 'Please enter your passcode to show the private key.',
            copyDescription: 'Press the button to copy your private key.',
            show: 'Show private key',
            done: 'Done',
            export: 'Export',
        },
        accountStatement: {
            title: 'Export transaction log',
            description:
                'Transaction logs of an account can be generated and downloaded from CCDScan.io.\n\nCCDScan is a Concordium block explorer, and pressing the button below will open the website in your browser.',
            link: 'Go to CCDScan.io',
        },
    },
    confirmTransfer: {
        submitted: 'Transaction submitted!',
        buttons: {
            back: 'Back',
            send: 'Send',
            finish: 'Finish',
        },
    },
    sendCcd: {
        labels: {
            ccd: 'Enter amount to transfer',
            recipient: 'Enter recipient address',
        },
        title: 'Send CCD',
        currentBalance: 'Current balance',
        unableToCoverCost: 'Insufficient CCD to cover estimated cost',
        unableToSendFailedInvoke: 'Simulation of transfer failed, unable to proceed.',
        transferInvokeFailed: 'Simulation of transfer failed: {{ message }}',
        unableToCreatePayload: 'Unable to create transaction: {{ message}}',
        nonexistingAccount: 'The recipient is not registered on the chain',
        fee: 'Estimated transaction fee',
    },
    tokens: {
        tabBar: {
            ft: 'Fungible',
            nft: 'Collectibles',
            manage: 'Manage',
        },
        add: {
            lookupTokens: 'Look for tokens',
            indexRequired: 'Contract index is required',
            negativeIndex: 'Contract index cannot be negative',
            invalidIndex: 'Contract index must be an integer',
            indexMax: 'Contract index can not exceed 18446744073709551615',
            noContractFound: 'No contract found on index',
            noTokensError: 'No tokens found in contract',
            failedTokensError:
                'The following errors were encountered while checking for tokens in the contract: \n{{ errors }}',
            contractIndex: 'Contract index',
            hexId: 'Invalid token ID (must be HEX encoded)',
            updateTokens: 'Update tokens',
            chooseContractHeader: 'Enter a contract index to select tokens from.',
            ItemBalancePre: 'Your balance: ',
            searchLabel: 'Search for token ID in {{ contractName }}',
            noValidTokenError: 'Token either does not exist or cannot be used in wallet',
            noTokensChange: 'No updates made to token list.',
            tokensChanged: 'Token list updated.',
            missingMetadata: 'Tokens could not be shown due to missing metadata.',
            emptyList: 'No tokens found.',
        },
        unownedUnique: 'Not owned',
        listAddMore: 'You can add more tokens from the Manage page.',
        listEmpty: 'You can add tokens from the Manage page.',
    },
    earn: {
        title: 'Earning rewards',
        description: 'There are two options for earning rewards on Concordium: Validation and delegation.',
        bakingHeader: 'Validation',
        bakingDescription:
            'As a validator you participate in the network by producing blocks on the Concordium network. This requires a minimum of {{ minAmount }} CCD and access to a dedicated node.',
        delegateHeader: 'Delegation',
        delegateDescription:
            "If you don't have access to your own node you may delegate your stake to one of the other validators. There is no minimum amount of CCD required when delegating\n\nChoose the option that suits you below to learn more.\n\nNOTE: A single account cannot both be a validator and delegator, but it is possible to stop one and change to the other.",
        delegateCta: 'Setup delegation',
        bakingCta: 'Setup validation',
    },
    baking: {
        registerIntro: {
            '1': {
                title: 'Become a validator',
                body: 'A validator is a node that participates in the network by validation (creating) new blocks that are added to the chain.\n\nEach validator has a set of cryptographic keys called validator keys that the node needs to bake blocks. You generate the validator keys when you add a validator account.\n\nOnce the validator node has been restarted with the validator keys, it will start validation two epochs after the transaction has been approved.',
            },
            '2': {
                title: 'The node',
                body: 'To become a validator you must run a node on the Concordium blockchain. Make sure that you have a setup where the node can operate around the clock.\n\nYou can run the node yourself or use a third-party provider. Make sure your account in the wallet has the required amount of CCD to become a validator.',
            },
            '3': {
                title: 'Opening a pool',
                body: 'You have the option when adding a validator to open a staking pool or not. A staking pool allows others who want to earn rewards to do so without the need to run a node or become a validator themselves.\n\nTo do this they delegate an amount to your staking pool which then increases your total stake and your chances of winning the lottery to bake a block. At each pay day the rewards will be distributed to you and your delegators.\n\nYou can also choose not to open a pool, in which case only your own stake applies toward the lottery. You can always open or close a pool later.',
            },
        },
        removeIntro: {
            '1': {
                title: 'Stop validation',
                body: 'If you no longer wish to bake on an account, you can stop validation. There is a cool-down period, during which the staked amount for the validator will continue to bake and earn rewards. After the cool-down, the full stake amount will be unlocked on your public balance.\n\nIf your pool has any delegators, they will be automatically moved to passive delegation, if they don’t decide to do something else.\n\nIf you deregister the validator, remember that this does not shut down your node. You must shut down the node in a separate action if you no longer wish to run a node on the Concordium blockchain.',
            },
        },
        updateIntro: {
            '2': {
                title: 'Update validator stake',
                body: 'When updating your validator stake you can choose to increase or decrease your stake. If you increase your stake, this is most often effective from the next pay day. If the transaction occurs too close to the next pay day, the update will be effective from the following pay day.\n\nIf you decrease your stake, there is a longer cool-down period. During the cool-down period, the staked amount continues to bake and earn rewards.\n\nYou can also adjust whether you want rewards restaked or not. If the transaction is not made too close to the next pay day, it will take effect then; otherwise it will be effective at the next pay day over.',
            },
            '3': {
                title: 'Update pool settings',
                body: 'If you choose to update pool settings, you have the following things to adjust. Changes to the individual parameters are optional, so you don’t have to change them all.\n\n<strong>Pool status</strong>:\n  • Open pool: open a pool for\n     a previously closed validator\n  • Closed for new: close the pool to new delegators.\n     Existing delegators are not affected.\n  • Close pool: close a pool for all delegators.\n\n<strong>Metadata URL</strong>:\n  • The metadata URL can be changed, removed,\n     or left the same.',
            },
            '4': {
                title: 'Update pool settings',
                body: 'There is a cool-down period if you choose to close a pool. During this time, all delegators continue in the pool, and the pool continues to earn rewards if it produces blocks.\n\nAfter the cool-down, the delegators are removed and the pool will be closed. The validator will keep validating with your own stake afterwards.\n\nChanges to the metadata URL take effect from the next pay day unless the transaction is made too close to the pay day. In that case, it will take effect from the pay day following.',
            },
            '5': {
                title: 'Update validator keys',
                body: 'If you believe your validator keys have been compromised or lost, you can generate and submit a new set of keys. It is important to remember to restart your node with the new set of keys after registering them on the chain.\n\nAs the update takes effect on chain from the next pay day, it is preferable to restart the node with the new keys as close to the next pay day as possible to prevent the validator from having down time.',
            },
        },
        register: {
            title: 'Register validator',
        },
        update: {
            title: {
                stake: 'Update validator stake',
                pool: ' Update pool settings',
                keys: 'Update validator keys',
            },
            noChanges: 'Your transaction contains no changes compared to the current validator.',
        },
        remove: {
            notice: 'Stopping a validator will take effect at the first pay day after a cool-down period of {{cooldownPeriod}} days. During the cool-down period the validator stake is locked and cannot be changed.',
        },
        details: {
            heading: 'Your validator is registered.',
            amount: 'Validator stake',
            restake: 'Rewards will be',
            update: 'Update',
            stop: 'Stop',
            pending: 'Waiting for transaction to finalize',
            failed: 'Transaction failed',
        },
        configure: {
            restake: {
                description:
                    'Do you want to automatically add your block rewards to your validator stake?\n\nIf you choose to not restake your rewards, the amounts will be at disposal on your account balance at each pay day.',
                optionRestake: 'Yes, restake',
                optionNoRestake: "No, don't restake",
            },
            amount: {
                description: 'Enter the amount you want to stake',
                amountLabel: 'Amount to stake',
                amountRequired: 'You must specify an amount to stake',
                locked: 'Amount locked',
                lockedNote: 'You are unable to change the amount while there is a pending change',
                overStakeThresholdWarning:
                    'You are about to lock more than {{ threshold }}% of your total balance in a validator stake.\n\nIf you don’t have enough unlocked CCD at your disposal, you might not be able to pay future transaction fees.',
                decreaseWarning:
                    'Reducing the validator stake will lock the total validator stake for a cool-down period. No changes can be made to the amount during this period, and the withdrawal will not take effect before the cool-down period is over.',
                enterNewStake: 'Enter new validator stake',
            },
            openForDelegation: {
                description:
                    'You have the option to open your validator as a pool for others to delegate their CCD to.\n\nIf you choose to open your pool, other people will be able to delegate CCDs to your validation pool.\n\nYou can also keep the pool closed, if you want only your own CCDs to be staked.',
            },
            commission: {
                description:
                    'When you open your validator as a pool, you earn commissions of stake delegated to your pool from other accounts:',
            },
            keys: {
                save: 'Export validator keys',
                description:
                    'Your new validator keys have been generated. Before you can continue, you must export and save them. The keys will have to be added to the validator node.\n\nNOTICE: Besides exporting the keys, you will have to finish and submit the transaction afterwards for the validator to be registered.',
                downloadedTitle: 'Notice',
                downloaded:
                    'Your keys have been downloaded as "{{ fileName}}", you can now continue to finish the transaction',
            },
            metadataUrl: {
                description:
                    "You can choose to add a URL with metadata about your validator. Leave it blank if you don't have any.",
                label: 'Enter metadata URL',
                maxLength: 'MetadataUrl length may not exceed {{ maxLength }}',
            },
            warning: 'Warning',
        },
    },
    delegate: {
        registerIntro: {
            '1': {
                title: 'Delegation',
                body: 'Delegation allows users on the Concordium blockchain to earn rewards without the need to become a validator or run a node.\n\nBy delegating some of your funds to a pool, you can earn rewards.\n\nOn the next few pages, we will go through the basics of delegation. If you want to learn more, you can visit our <1>documentation website</1>.',
            },
            '2': {
                title: 'Delegation models',
                body: "There are two staking models that a delegator can choose:<2><3>Delegating to a specific pool</3><3>Passive delegation</3></2>A staking pool is managed by an individual validator running a node, so the rewards depend on that validator's performance.\n\nSince passive delegation doesn't go to a specific pool, it mitigates the risk of a single validator performing badly, however, rewards are lower.\n\nFor more info, visit our <1>documentation website</1>.",
            },
            '3': {
                title: 'Staking pools',
                body: "A staking pool is managed by an individual validator.\n\nRunning a pool allows a validator to attract more stake and thus increate chances of being selected to bake a block.\n\nValidators earn a commision from the delegators upon validation a block.\n\nDelegating to a staking pool is usually more profitable than passive delegation, but there is also a risk of losing out on rewards if the validator is not running properly. It is therefore a good idea to keep an eye on the validator's performance.\n\nYou can read more about how to investigate a validator's performance on our <1>documentation website</1>.",
            },
            '4': {
                title: 'Passive delegation',
                body: 'For CCD holders who do not want to regularly check the performance of a chosen pool, but just want a stable way of earning rewards, passive delegation offers a low-risk, low-reward alternative.\n\nThis staking strategy is not associated with a specific validator, so there is no risk of poor validator health.\n\nThe trade off when choosing passive delegation is that the return on your stake will be less than what you may receive, when delegating to a specific staking pool.',
            },
            '5': {
                title: 'Pay days',
                body: 'Whether you choose an individual validation pool or passive delegation, rewards are paid out at what is called the pay day. Rewards are distributed to everyone in the pool proportioned to their stake, and a commission is paid to the validator by all delegators.\n\nIf you make updates to your delegation at a later point, most of these will also take effect from the next pay day.\n\nTo read more about the pay day, you can visit our <1>documentation website</1>.',
            },
            '6': {
                title: 'Lock-in and cool-downs',
                body: 'When you make a delegation to either type of pool, your delegation amount will be locked on your account.\n\nThis means that you cannot use the amount for anything while it is still locked in for delegation.\n\nIf you decrease your delegation amount or stop the delegation altogether, the amount will still be locked for a cool-down period. While in the cool-down period, that full delegation amount will keep earning rewards.\n\nAs transactions cost a fee, it is important to take into consideration, that you will need some unlocked funds on your public balance to pay the fee for unlocking your delegation amount again.',
            },
            '7': {
                title: 'The status page',
                body: 'After starting a delegation, you will be able to see its current status on the status screen.\n\nFrom there, you can also make updates to your delegation, or stop it again.',
            },
        },
        updateIntro: {
            '1': {
                title: 'Updating your delegation',
                body: 'When you update your delegation, you can choose to increase or decrease your stake, change target pool, and/or change whether rewards are restaked or not.\n\nThe different parameters are optional, so you can choose to not update all settings.\n\nOn the next few pages we will go through the different options and a few reminders on the delegation concepts.',
            },
            '2': {
                title: 'Pay day updates',
                body: 'If you increase your delegation amount, change your target staking pool, or change whether you want to restake your rewards or not, these changes will take effect from the next pay day.\n\nThis will typically be within a period of 24 hours, but in some cases it can take up to 25 hours. ',
            },
            '3': {
                title: 'Updates with longer cool-downs',
                body: 'If you decrease your stake, the change will take effect after a cool-down period.\n\nWhile in this cool-down period, the stake is locked and cannot be changed, and you will not be able to stop your delegation.\n\nYour delegation continues earning rewards during the cool-down period. While in the cool-down period you can update other delegation settings, but not the amount.\n\nIf you made any other changes to your delegation while also decreasing your delegation amount, the other changes will take effect from the next pay day as described on the previous page.',
            },
        },
        removeIntro: {
            '1': {
                title: 'Stop your delegation',
                body: 'If you decide to stop your delegation, there is a longer cool-down period.\n\nWhile in the cool-down period your delegation continues to earn rewards.\n\nAt the end of the cool-down period, the delegated amount is unlocked on your public balance, and the funds will be at disposal again.',
            },
            '2': {
                title: 'Update during the cool-down period',
                body: 'Only the delegation amount is locked during the cool-down period.\n\nThis means that you can still change restake status and target staking pool during the cool-down.',
            },
        },
        remove: {
            notice: 'Stopping delegation will take effect at the first pay day after a cool-down period of {{cooldownPeriod}} days. During the cool-down period the delegation amount is locked and cannot be changed.',
        },
        details: {
            heading: 'Your delegation is registered.',
            target: 'Target',
            targetPassive: 'Passive delegation',
            targetBaker: 'Validator {{bakerId}}',
            restake: 'Rewards will be',
            optionRestake: 'Added to delegation amount',
            optionNoRestake: 'Added to public balance',
            updateDelegation: 'Update',
            stopDelegation: 'Stop',
            pending: 'Waiting for transaction to finalize',
            failed: 'Transaction failed',
        },
        register: {
            title: 'Register delegation',
        },
        update: {
            title: 'Update delegation',
            noChanges: 'Your transaction contains no changes compared to the current delegation.',
        },
        configure: {
            pool: {
                description1:
                    'You can delegate to an open pool of your choice, or you can stake using passive delegation',
                optionBaker: 'Validator',
                optionPassive: 'Passive',
                descriptionBaker:
                    "If you don't already know which staking pool you want to delegate an amount to, you can read more about finding one by visiting our <1>documentation website</1>",
                descriptionPassive:
                    'Passive delegation is an alternative to delegation to a specific staking pool that has lower rewards. With passive delegation you do not have to worry about the uptime or quality of a validator node.\n\nFor more info, you can visit our <1>documentation website</1>',
                bakerIdLabel: 'Validator ID',
                bakerIdRequired: 'You must specify a validator ID',
                targetNotOpenForAll: 'Targeted validator does not allow new delegators',
                currentStakeExceedsCap: "Your current stake would violate the targeted validator's cap",
                chosenStakeExceedsCap: "Chosen stake would violate validator's cap",
                notABaker: "Supplied validator ID doesn't match an active validator.",
            },
            amount: {
                description: 'Enter the amount you want to delegate',
                amountLabel: 'Amount to delegate',
                amountRequired: 'You must specify an amount to delegate',
                optionRedelegate: 'Yes, restake',
                optionNoRedelegate: "No, don't restake",
                descriptionRedelegate:
                    'Do you want to automatically add your delegation rewards to your delegated amount?\n\nIf you choose to not restake your rewards, the amounts will be at disposal on your account balance at each pay day.',
                locked: 'Amount locked',
                lockedNote: 'You are unable to change the amount while there is a pending change',
                overStakeThresholdWarning:
                    'You are about to lock more than {{ threshold }}% of your total balance in a delegation stake.\n\nIf you don’t have enough unlocked CCD at your disposal, you might not be able to pay future transaction fees.',
                decreaseWarning:
                    'Reducing the delegation amount will lock the total delegation amount for a cool-down period. No changes can be made to the amount during this period, and the withdrawal will not take effect before the cool-down period is over.',
                enterNewStake: 'Enter new delegation stake',
            },
        },
    },
    transactionMessage: {
        configureBaker: {
            registerBaker:
                'You are about to submit a register validator transaction that locks some of your funds in a stake. If you want to unlock the stake again, there will be a cool-down period of {{ cooldownPeriod }} days.',
            lowerBakerStake:
                'You are about to submit a validator transaction that lowers your validator stake. It will take effect at the first pay day after a cool-down period {{ cooldownPeriod }} days and the validator stake cannot be changed during this period of time.',
            removeBaker:
                'Are you sure you want to make the following transaction to stop validation? It will take effect at the first pay day after a cool-down period {{ cooldownPeriod }} days and the validator stake cannot be changed during this period of time.',
        },
        configureDelegation: {
            register:
                'You are about to submit a register delegation transaction that locks some of your funds in a stake. If you want to unlock the stake again, there will be a cool-down period of {{ cooldownPeriod }} days.',
            lowerDelegationStake:
                'You are about to submit a delegation transaction that lowers your delegation amount. It will take effect at the first pay day after a cool-down period {{ cooldownPeriod }} days and the delegation amount cannot be changed during this period of time.',
            remove: 'Are you sure you want to make the following transaction to stop delegation? It will take effect at the first pay day after a cool-down period {{ cooldownPeriod }} days and the delegation amount cannot be changed during this period of time.',
        },
    },
    transactionPopup: {
        configureBaker: {
            start: 'Once your transaction has successfully finalized, the validator registration will take effect from the next pay day.\n\nRemember to restart your node with the validator keys.',
            update: 'Once your transaction has successfully finalized, the validator update will take effect from the next pay day.',
            updateKeys:
                'Once your transaction has successfully finalized, the new validator keys will take effect from the next pay day.\n\nThis means the node should be restarted with the new keys, as close to the next pay day as possible.',
        },
        configureDelegation: {
            start: 'Once your transaction has successfully finalized, the delegation will take effect from the next pay day.',
            update: 'Once your transaction has successfully finalized, the delegation update will take effect from the next pay day.',
        },
    },
    accountPending: 'This account is still pending finalization.',
    accountRejected: 'This account failed to be created.',
    request: 'Create account',
    unknown: 'unknown',
    important: 'Important',
    warning: 'Warning',
};

export default t;

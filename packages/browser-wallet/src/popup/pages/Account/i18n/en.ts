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
    },
    settings: {
        connectedSites: {
            title: 'Connected sites',
            noConnected: 'The selected account is not connected to any sites.',
            connect: 'Connect',
            disconnect: 'Disconnect',
        },
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
        buttons: {
            continue: 'Continue',
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
            noContractFound: 'No contract found on index',
            noTokensError: 'No tokens found in contract',
            failedTokensError: 'Error occurred when checking for tokens in the contract',
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
        description: 'There are two options for earning rewards on Concordium: Baking and delegation.',
        bakingHeader: 'Baking',
        bakingDescription:
            'As a baker you participate in the network by baking blocks on the Concordium network. This requires a minimum of {{ minAmount }} CCD and access to a dedicated node.',
        delegateHeader: 'Delegation',
        delegateDescription:
            "If you don't have access to your own node you may delegate your stake to one of the other bakers. There is no minimum amount of CCD required when delegating\n\nChoose the option that suits you below to learn more.\n\nNOTE: A single account cannot both be a baker and delegator, but it is possible to stop one and change to the other.",
        delegateCta: 'Setup delegation',
        bakingCta: 'Setup baking',
    },
    delegate: {
        registerIntro: {
            '1': {
                title: 'Delegation',
                body: 'Delegation allows users on the Concordium blockchain to earn rewards without the need to become a baker or run a node.\n\nBy delegating some of your funds to a pool, your can earn rewards.\n\nOn the next few pages, we will go through the basics of delegation. If you want to learn more, you can visit our <1>documentation website</1>.',
            },
            '2': {
                title: 'Delegation models',
                body: "There are two staking models that a delegator can choose:<2><3>Delegating to a specific pool</3><3>Passive delegation</3></2>A baker pool is managed by an individual baker running a node, so the rewards depend on that baker's performance.\n\nSince passive delegation doesn't go to a specific pool, it mitigates the risk of a single baker performing badly, however, rewards are lower.\n\nFor more info, visit our <1>documentation website</1>.",
            },
            '3': {
                title: 'Baker pools',
                body: "A baker pool is managed by an individual baker.\n\nRunning a pool allows a baker to attract more stake and thus increate chances of being selected to bake a block.\n\nBakers earn a commision from the delegators upon baking a block.\n\nDelegating to a baker pool is usually more profitable that passive delegation, but there is also a risk of losing out on rewards if the baker is not running properly. It is therefore a good idea to keep an eye on the baker's performance.\n\nYou can read more about how to investigate a baker's performance on our <1>documentation website</1>.",
            },
            '4': {
                title: 'Passive delegation',
                body: 'For CCD holders who do not want to regularly check the performance of a chosen pool, but just want a stable way of earning rewards, passive delegation offers a low-risk, low-reward alternative.\n\nThis staking strategy is not associated with a specific baker, so there is no risk of poor baker health.\n\nThe trade off when choosing passive delegation is that the return on your stake will be less than what you may receive, when delegating to a specific baker pool.',
            },
            '5': {
                title: 'Pay days',
                body: 'Whether you choose an individual baking pool or passive delegation, rewards are paid out at what is called the pay day. Rewards are distributed to everyone in the pool proportioned to their stake, and a commission is paid to the baker by all delegators.\n\nIf you make updates to your delegation at a later point, most of these will also take effect from the next pay day.\n\nTo read more about the pay day, you can visit our <1>documentation website</1>.',
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
                body: 'If you increase your delegation amount, change your target baker pool, or change whether you want to restake your rewards or not, these changes will take effect from the next pay day.\n\nThis will typically be within a period of 24 hours, but in some cases it can take up to 25 hours. ',
            },
            '3': {
                title: 'Updates with longer cool-downs',
                body: 'If you decrease your stake, the change will take effect after a cool-down period.\n\nWhile in this cool-down period, the stake is locked and cannot be changed, and you will not be able to stop your delegation.\n\nYour delegation continues earning rewards during the cool-down period. While in the cool-down period you can update other delegation settings, but not the amount\n\n.If you made any other changes to your delegation while also decreasing your delegation amount, the other changes will take effect from the next pay day as described on the previous page.',
            },
        },
        removeIntro: {
            '1': {
                title: 'Stop your delegation',
                body: 'If you decide to stop your delegation, there is a longer cool-down period.\n\nWhile in the cool-down period your delegation continues to earn rewards.\n\nAt the end of the cool-down period, the delegated amount is unlocked on your public balance, and the funds will be at disposal again.',
            },
            '2': {
                title: 'Update during the cool-down period',
                body: 'Only the delegation amount is locked during the cool-down period.\n\nThis means that you can still change restake status and target baker pool during the cool-down.',
            },
        },
        details: {
            heading: 'Your delegation is registered',
            amount: 'Delegation amount',
            target: 'Target',
            targetPassive: 'Passive delegation',
            targetBaker: 'Baker {{bakerId}}',
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
            noChanges: 'Transaction includes no changes to existing delegation configuration for account.',
        },
        configure: {
            pool: {
                description1:
                    'You can delegate to an open pool of your choice, or you can stake using passive delegation',
                optionBaker: 'Baker',
                optionPassive: 'Passive',
                descriptionBaker:
                    "If you don't already know which baker pool you want to delegate an amount to, you can read more about finding one by visiting our <1>documentation website</1>",
                descriptionPassive:
                    'Passive delegation is an alternative to delegation to a specific baker pool that has lower rewards. With passive delegation you do not have to worry about the uptime or quality of a baker node.\n\nFor more info, you can visit our <1>documentation website</1>',
                bakerIdLabel: 'Baker ID',
                bakerIdRequired: 'You must specify a baker ID',
                targetNotOpenForAll: 'Targeted baker does not allow new delegators',
                currentStakeExceedsCap: "Your current stake would violate the targeted baker's cap",
                chosenStakeExceedsCap: "Chosen stake would violate baker's cap",
                notABaker: "Supplied baker ID doesn't match an active baker.",
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
                enterNewStake: 'Enter new delegation stake',
            },
            continueButton: 'Continue',
            warning: 'Warning',
        },
    },
    accountPending: 'This account is still pending finalization.',
    accountRejected: 'This account failed to be created.',
    request: 'Create account',
    unknown: 'unknown',
};

export default t;

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
        bakingHeader: 'Baking (coming soon)',
        bakingDescription:
            'As a baker you participate in the network by baking blocks on the Concordium network. This requires a minimum of {{ minAmount }} CCD and access to a dedicated node.',
        delegateHeader: 'Delegation',
        delegateDescription:
            "If you don't have access to your own node you may delegate your stake to one of the other bakers. There is no minimum amount of CCD required when delegating\n\nChoose the option that suits you below to learn more.\n\nNOTE: A single account cannot both be a baker and delegator, but it is possible to stop one and change to the other.",
        delegateCta: 'Continue to delegation setup',
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
                body: "A baker pool is managed by an individual baker.\n\nRunning a pool allows a baker to attract more stake and thus increate chances of being selectd to bake a block.\n\nBakers earn a commision from the delegators upon baking a block.\n\nDelegating to a baker pool is usually more profitable that passive delegation, but there is also a risk of losingout on rewards if the baker is not running properly. It is therefore a good idea to keep an eye on the baker's performance.\n\nYou can read morea bout how to investigate a baker's performance on our <1>documentation website</1>.",
            },
            '4': {
                title: 'Passive delegation',
                body: 'For CCD holders who do not want to regularly check the performance of a chosen pool, but just want a stable way of earning rewards, passive delegation offers a low-risk, low-reward alternative.\n\nThis staking strategy is not associated with a specific baker, so there is no risk of poor baker health.\n\nThe trade off when choosing passive delegation is that the return on your stake will be less than what you may receive, when delegatin gto a specific baker pool.',
            },
            '5': {
                title: 'Pay days',
                body: 'Whether you choose an individual baking pool or passive delegation, rewards are paid out at what is called the pay day. Rewards are distribured to everyone in the pool proportioned to their stake, and a commission is paid to the baker by all delegators.\n\nIf you make updates to your ddelegation at a later point, most o fthese will also take effect from the next pay day.\n\nTo read more about the pay day, you can visit our <1>documentation website</1>.',
            },
            '6': {
                title: 'Lock-in and cool-downs',
                body: 'When you make a delegation to either type of pool, your delegation amount will be locked on your account.\n\nThis means that you cannot use the amount for anything while it is still locked in for delegation.\n\nIf you decrease your delegation amount or stop the delegation altogether, the amount will still be locked for a cool-down period. While in the cool-down period, that full delegation amount will keep earning rewards.\n\nAs transactions cost a fee, it is important to take into consideration, that you will need some unlocked funds on your public balance to pay the fee for unlocking your delegation amount again.',
            },
            '7': {
                title: 'The status page',
                body: 'After starting a delegatoin, you will be able to see its current status on the status screen.\n\nFrom there, you can also make updates to your delegation, or stop it again.',
            },
        },
        register: {
            title: 'Register delegation',
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
            },
            amount: {
                amountLabel: 'Amount to delegate',
                amountRequired: 'You must specify an amount to delegate',
                optionRedelegate: 'Yes, restake',
                optionNoRedelegate: "No, don't restake",
                descriptionRedelegate:
                    'Do you want ot automatically add your delegation rewards to your delegated amount?\n\nIf you choose to not restake your rewardds, the amounts will be at disposal on your account balance at each pay day.',
            },
            continueButton: 'Continue',
        },
    },
    accountPending: 'This account is still pending finalization.',
    accountRejected: 'This account failed to be created.',
    request: 'Create account',
    unknown: 'unknown',
};

export default t;

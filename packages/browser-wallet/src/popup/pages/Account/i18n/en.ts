const t = {
    noAccounts: 'You have no accounts in your wallet',
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
    },
    sendCcd: {
        labels: {
            ccd: 'Enter amount to transfer',
            recipient: 'Enter recipient address',
        },
        buttons: {
            back: 'Back',
            send: 'Send',
            finish: 'Finish',
            continue: 'Continue',
        },
        title: 'Send CCD',
        currentBalance: 'Current balance',
        unableToCoverCost: 'Insufficient CCD to cover estimated cost',
        transferInvokeFailed: 'Unable to simulate transfer. Therefore cost cannot be estimated.',
        fee: 'Estimated transaction fee',
    },
    tokens: {
        tabBar: {
            ft: 'Fungible',
            nft: 'Collectibles',
            new: 'Add new',
        },
        add: {
            chooseContract: 'Choose Contract',
            indexRequired: 'Contract index is required',
            contractIndex: 'Contract index',
            hexId: 'Id must be HEX encoded',
            updateTokens: 'Update tokens',
            chooseContractHeader: 'Enter a contract index to select tokens from.',
            ItemBalancePre: 'Your balance: ',
            searchLabel: 'Search for token ID in {{ contractName }}',
            noValidTokenError: 'Token either does not exist or cannot be used in wallet',
        },
        unownedUnique: 'Not owned',
    },
    accountPending: 'This account is still pending finalization.',
    request: 'Create account',
    unknown: 'unknown',
};

export default t;

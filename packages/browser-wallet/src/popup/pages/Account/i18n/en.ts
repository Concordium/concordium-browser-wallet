const t = {
    noAccounts: 'No accounts in wallet',
    removeAccount: 'Remove account (local only)',
    resetConnections: 'Reset connections',
    accountAddress: 'Account address',
    siteConnected: 'Connected',
    siteNotConnected: 'Not connected',
    accountBalanceError: 'Unable to retrieve account balance',
    actions: {
        log: 'transaction log',
        send: 'send ccd',
        receive: 'receive ccd',
        settings: 'account settings',
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
        receiptTitle: 'Transaction: Send CCD',
        fee: 'Estimated transaction fee',
    },
    accountPending: 'This account is still pending finalization.',
};

export default t;

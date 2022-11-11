const t = {
    form: {
        password: {
            tooWeak: 'Very weak',
            weak: 'Weak',
            medium: 'Medium',
            strong: 'Strong',
        },
    },
    id: {
        header: 'Concordium identity',
        pending: 'Pending verification with',
        confirmed: 'Verified by',
        rejected: 'Rejected by',
    },
    account: {
        error: 'Unable to retrieve account balance',
    },
    utils: {
        address: {
            required: 'Please enter an address',
            invalid: 'Invalid address',
        },
        ccdAmount: {
            required: 'Please enter an amount',
            invalid: 'Invalid amount',
            insufficient: 'Insufficient funds',
            zero: 'Amount may not be zero',
        },
        transaction: {
            type: {
                simple: 'Send CCD',
                init: 'Initialize Smart Contract Instance',
                update: 'Update Smart Contract Instance',
                unknown: 'Unknown',
            },
        },
    },
    transactionReceipt: {
        sender: 'Sender account',
        cost: 'Estimated transaction fee',
        unknown: 'Unknown',
        tokenTransfer: {
            title: 'Send {{ tokenName }}',
            amount: 'Amount',
            receiver: 'Receiver',
            showTransfer: 'Show simple details',
            showContract: 'Show full details',
        },
    },
    tokenDetails: {
        balance: 'Balance',
        description: 'Description',
        ownership: 'Ownership',
        ticker: 'Ticker',
        decimals: 'Decimals',
        contractIndex: 'Contract index, subindex',
        removeToken: "Don't show token in wallet",
        showRawMetadata: 'Show raw metadata',
        unownedUnique: 'Not owned',
        ownedUnique: 'Owned',
        tokenId: 'Token ID',
        removePrompt: {
            header: 'Hide {{ name }} in your wallet',
            text: 'Are you sure you want hide this token in your wallet? You can always add it again from the tokens list.',
            cancel: 'Keep token',
            remove: 'Remove token',
        },
    },
};

export default t;

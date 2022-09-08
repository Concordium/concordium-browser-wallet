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
    },
};

export default t;

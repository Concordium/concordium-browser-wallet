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
                simple: 'Send Ccd',
                init: 'Initialize Smart Contract Instance',
                update: 'Update Smart Contract Instance',
                unknown: 'Unknown',
            },
        },
    },
    transactionReceipt: {
        sender: 'Sender account',
        cost: 'Estimated transaction fee',
        title: 'Transaction: {{ typeName }}',
    },
};

export default t;

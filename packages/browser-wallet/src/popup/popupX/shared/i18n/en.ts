const t = {
    form: {
        password: {
            tooWeak: 'Very weak',
            weak: 'Weak',
            medium: 'Medium',
            strong: 'Strong',
        },
        tokenAmount: {
            token: {
                label: 'Token',
                available: '{{balance}} {{name}} available',
            },
            amount: {
                label: 'Amount',
                fee: 'Estimated transaction fee: {{fee}}',
            },
            address: {
                label: 'Receiver address',
            },
        },
    },
    utils: {
        address: {
            required: 'Please enter an address',
        },
        amount: {
            required: 'Please enter an amount',
            zero: 'Amount may not be zero',
        },
    },
};

export default t;

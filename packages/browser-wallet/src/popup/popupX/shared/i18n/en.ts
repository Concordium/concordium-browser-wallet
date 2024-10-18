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
            invalid: 'Invalid address',
        },
        amount: {
            required: 'Please enter an amount',
            invalid: 'Invalid amount',
            insufficient: 'Insufficient funds',
            zero: 'Amount may not be zero',
            belowBakerThreshold: 'Minimum stake: {{ threshold }}',
            exceedingDelegationCap: "Amount may not exceed the target pool's cap of {{ max }}.",
        },
    },
};

export default t;

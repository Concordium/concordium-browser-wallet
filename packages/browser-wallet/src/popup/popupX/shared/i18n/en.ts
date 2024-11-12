const t = {
    form: {
        password: {
            tooWeak: 'Very weak',
            weak: 'Weak',
            medium: 'Medium',
            strong: 'Strong',
            incorrectPasscode: 'Incorrect passcode',
            currentPasscode: 'Enter current passcode',
            passcodeRequired: 'A passcode must be entered',
        },
        tokenAmount: {
            token: {
                label: 'Token',
                available: '{{balance}} available',
            },
            amount: {
                label: 'Amount',
                fee: 'Estimated transaction fee:',
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
    idCard: {
        name: {
            edit: 'Edit Name',
            save: 'Save',
            abort: 'Abort',
        },
        verifiedBy: 'Verified by {{idProviderName}}',
    },
};

export default t;
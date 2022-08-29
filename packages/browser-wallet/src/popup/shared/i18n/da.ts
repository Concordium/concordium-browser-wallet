import type en from './en';

const t: typeof en = {
    form: {
        password: {
            tooWeak: 'Meget svagt',
            weak: 'Svagt',
            medium: 'Medium',
            strong: 'Stærkt',
        },
    },
    id: {
        header: 'Concordium identitet',
        pending: 'Afventer godkendelse fra',
        confirmed: 'Godkendt af',
        rejected: 'Afvist af',
    },
    // TODO: translate
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
    },
};

export default t;

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
    utils: {
        address: {
            required: 'Skriv en addresse',
            invalid: 'Invalid addresse',
        },
        ccdAmount: {
            required: 'Skriv et beløb',
            invalid: 'Invalid beløb',
            insufficient: 'Ikke nok penge',
            zero: 'Beløbet må ikke være nul',
        },
    },
    transactionReceipt: {
        sender: 'Sendende konti',
        cost: 'Estimeret transaktions afgift',
    },
};

export default t;

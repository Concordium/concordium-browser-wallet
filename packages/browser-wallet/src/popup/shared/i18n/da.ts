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
    account: {
        error: 'Fejl ved hentning af kontoens balance',
    },
    utils: {
        address: {
            required: 'Indtast en addresse',
            invalid: 'Ugyldig addresse',
        },
        ccdAmount: {
            required: 'Indtast et beløb',
            invalid: 'Ugyldigt beløb',
            insufficient: 'Ikke nok penge',
            zero: 'Beløbet må ikke være nul',
        },
        transaction: {
            type: {
                simple: 'Send Ccd',
                init: 'Opret Smart Contract Instans',
                update: 'Opdater Smart Contract Instans',
                unknown: 'Ukendt',
            },
        },
    },
    transactionReceipt: {
        sender: 'Afsender',
        cost: 'Estimerede transaktionsomkostninger',
        unknown: 'Ukendt',
    },
};

export default t;

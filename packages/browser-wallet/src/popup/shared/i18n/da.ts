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
                simple: 'Send CCD',
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

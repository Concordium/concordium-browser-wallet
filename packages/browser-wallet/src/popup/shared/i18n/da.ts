import type en from './en';

const t: typeof en = {
    root: {
        loading: 'Henter brugerindstillinger...',
    },
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
    entityList: {
        searchPlaceholder: 'Søg',
    },
};

export default t;

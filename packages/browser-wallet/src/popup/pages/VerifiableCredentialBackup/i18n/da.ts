import en from './en';

const t: typeof en = {
    import: {
        title: 'Importer Web3 ID Credentials',
        noImported: 'Ingen Web3 ID Credentials blev importeret',
        error: 'Det var ikke muligt at importere den valgte fil. Filen skal være en backup lavet med en samme seed phrase.',
    },
    backup: {
        header: 'Web3 ID Credentials backup',
        button: {
            import: 'Gå til Import siden',
            export: 'Download eksport filen',
        },
    },
    close: 'Luk',
};

export default t;

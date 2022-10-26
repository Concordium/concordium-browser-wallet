import type en from './en';

const t: typeof en = {
    title: 'Concordium',
    nav: {
        home: 'Hjem',
        setup: 'Indstillinger',
    },
    header: {
        accounts: 'Konti',
        ids: 'ID kort',
        settings: {
            main: 'Wallet indstillinger',
            recovery: 'Genskabning af din wallet',
            network: 'Netværksindstillinger',
            passcode: 'Skift adgangskode',
            about: 'Om',
        },
        addTokens: 'Tilføj tokens',
        request: 'Anmodning om Signatur',
        connect: 'Ny Forbindelse',
    },
    entityList: {
        searchPlaceholder: 'Søg',
        noMatches: 'Ingen resultater',
    },
    accountList: {
        new: 'Tilføj ny',
    },
    identityList: {
        new: 'Anmod ny',
    },
};

export default t;

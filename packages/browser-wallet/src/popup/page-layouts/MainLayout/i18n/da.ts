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
        verifiableCredentials: 'Legitimationsoplysninger',
        settings: {
            main: 'Wallet indstillinger',
            allowlist: 'Tilladelsesliste',
            recovery: 'Genskabning af din wallet',
            network: 'Netværksindstillinger',
            passcode: 'Skift adgangskode',
            about: 'Om',
        },
        addWeb3IdCredential: 'Tilføj Web3Id Credential',
        connectAccountsRequest: 'Forbind konti',
        addTokens: 'Tilføj tokens',
        idProof: 'Bevis for identitet',
        request: 'Anmodning om Signatur',
        connect: 'Ny Forbindelse',
        allowlistingRequest: 'Anmodning om tilladelse',
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

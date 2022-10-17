import type en from './en';

const t: typeof en = {
    noAccounts: 'Du har ingen konti i din wallet.',
    removeAccount: 'Fjern konto (kun lokalt)',
    resetConnections: 'Fjern forbindelser',
    accountAddress: 'Konto adresse',
    siteConnected: 'Forbundet',
    siteNotConnected: 'Ikke forbundet',
    accountBalanceError: 'Fejl ved hentning af kontoens balance',
    actions: {
        log: 'Transaktionslog',
        send: 'Send CCD',
        receive: 'Modtag CCD',
        settings: 'Kontoindstillinger',
        tokens: 'Tokens',
    },
    details: {
        total: 'Offentligt total',
        atDisposal: 'Offentligt til rådighed',
        stakeAmount: 'Stake',
    },
    settings: {
        connectedSites: {
            title: 'Forbundne hjemmesider',
            noConnected: 'Den valgte konto er ikke forbundet til nogen hjemmeside.',
            connect: 'Forbind',
            disconnect: 'Fjern',
        },
        exportPrivateKey: {
            title: 'Eksportér privatnøgle',
            description: 'Indtast venligst din adgangskode for at vise din private nøgle.',
            copyDescription: 'Tryk på knappen for at kopiere din private nøgle.',
            show: 'Vis privatnøgle',
            done: 'Færdig',
            export: 'Eksporter',
        },
    },
    sendCcd: {
        labels: {
            ccd: 'Indtast et beløb at overføre',
            recipient: 'Indtast modtager addresse',
        },
        buttons: {
            back: 'tilbage',
            send: 'Send',
            finish: 'Færdigør',
            continue: 'Fortsæt',
        },
        title: 'Send CCD',
        fee: 'Estimerede transaktionsomkostninger',
    },
    tokens: {
        indexRequired: 'Kontrakt indeks er påkrævet',
        chooseContract: 'Vælg kontrakt',
        contractIndex: 'Kontrakt Indeks',
        contractName: 'Kontrakt navn',
        tokenId: 'Token id',
        addToken: 'Tilføj token',
        duplicateId: 'Token er allerede i listen',
        updateTokens: 'Opdater tokens',
        hexId: 'Id skal være HEX encodet',
    },
    accountPending: 'Denne konto er stadig ved at blive oprettet.',
    request: 'Opret konto',
};

export default t;

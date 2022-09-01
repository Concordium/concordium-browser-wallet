import type en from './en';

const t: typeof en = {
    noAccounts: 'Ingen konti i wallet',
    removeAccount: 'Fjern konto (kun lokalt)',
    resetConnections: 'Fjern forbindelser',
    accountAddress: 'Konto adresse',
    siteConnected: 'Forbundet',
    siteNotConnected: 'Ikke forbundet',
    accountBalanceError: 'Fejl ved hentning af kontoens balance',
    actions: {
        log: 'transaktionslog',
        send: 'send ccd',
        receive: 'modtag ccd',
        settings: 'kontoindstillinger',
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
        },
    },
    sendCcd: {
        labels: {
            ccd: 'Indtast et beløb at overføre',
            recipient: 'Indtast modtager addresse',
        },
        buttons: {
            back: 'tilbage',
            confirm: 'Bekræft',
            finish: 'Færdigør',
            continue: 'Fortsæt',
        },
        title: 'Send CCD',
        receiptTitle: 'Transaktion: Send CCD',
        fee: 'Estimerede transaktionsomkostninger',
    },
    accountPending: 'Denne konto er stadig ved at blive oprettet.',
};

export default t;
